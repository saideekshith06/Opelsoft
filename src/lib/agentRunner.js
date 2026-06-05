import pool from './db';
import { callLLMForJson } from './llm.js';
import { scrapeCustomCareerPage, closeScraperBrowser } from './scraper.js';
import { discoverCareerPages } from './discovery.js';

// Extractor: Parse Greenhouse token
function parseGreenhouseToken(url) {
  const match = url.match(/boards\.greenhouse\.io\/([^/?#]+)/i);
  return match ? match[1] : null;
}

// Extractor: Parse Lever token
function parseLeverToken(url) {
  const match = url.match(/(?:jobs\.lever\.co|lever\.co)\/([^/?#]+)/i);
  return match ? match[1] : null;
}

const SCORING_DIMENSIONS = ['role_match', 'skills_alignment', 'seniority_fit', 'compensation', 'location_feasibility', 'company_stage'];

// Map a 0-100 score to a letter grade.
function gradeFromScore(score) {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// Ensure a match result always carries a complete `evaluation` object
// (dimensions + grade + legitimacy), whether it came from the LLM or the heuristic.
function normalizeEvaluation(matchResult) {
  const score = matchResult.match_score;
  const dims = matchResult.dimensions && typeof matchResult.dimensions === 'object' ? matchResult.dimensions : {};
  const dimensions = {};
  for (const key of SCORING_DIMENSIONS) {
    const d = dims[key] || {};
    const raw = typeof d.score === 'number' ? d.score : Math.round(score / 20); // 0-100 -> ~1-5
    dimensions[key] = { score: Math.max(1, Math.min(5, raw || 1)), note: d.note || '' };
  }
  const legitimacy = matchResult.legitimacy && typeof matchResult.legitimacy === 'object'
    ? { is_legit: matchResult.legitimacy.is_legit !== false, confidence: matchResult.legitimacy.confidence || 'medium', flags: Array.isArray(matchResult.legitimacy.flags) ? matchResult.legitimacy.flags : [] }
    : { is_legit: true, confidence: 'low', flags: [] };
  return {
    grade: matchResult.grade || gradeFromScore(score),
    dimensions,
    legitimacy,
  };
}

/**
 * Execute the autonomous AI scraper and scoring pipeline for a single candidate.
 * @param {number} userId 
 * @param {function} addLog (message, type) => void
 * @returns {Promise<Array>} List of matched jobs
 */
export async function executeAgentPipeline(userId, addLog) {
  // 1. Fetch Candidate details and profile
  const [users] = await pool.query(`
    SELECT u.id, u.username, u.email, cp.*
    FROM new_users u
    JOIN new_candidate_profiles cp ON u.id = cp.user_id
    WHERE u.id = ?
  `, [userId]);

  if (!users || users.length === 0) {
    throw new Error(`Candidate user ID ${userId} profile not found.`);
  }
  const candidate = users[0];
  
  addLog(`Target Candidate Profile: ${candidate.first_name || candidate.username} (${candidate.job_title || 'Software Engineer'})`, 'info');
  
  // Parse candidate profile details
  const candidateSkills = typeof candidate.skills === 'string' ? JSON.parse(candidate.skills || '[]') : (candidate.skills || []);
  const candidateExp = typeof candidate.experience === 'string' ? JSON.parse(candidate.experience || '[]') : (candidate.experience || []);
  const candidateEdu = typeof candidate.education === 'string' ? JSON.parse(candidate.education || '[]') : (candidate.education || []);
  
  // 2. Fetch Candidate AI Agent config
  const [configs] = await pool.query("SELECT * FROM new_ai_agent_configs WHERE user_id = ?", [userId]);
  const config = configs[0] || {
    status: 'active',
    preferred_roles: ['Software Engineer', 'React Developer', 'Fullstack Engineer'],
    target_locations: ['London', 'Remote'],
    target_salary: '35000',
    min_match_score: 70
  };
  
  const preferredRoles = typeof config.preferred_roles === 'string' ? JSON.parse(config.preferred_roles) : (config.preferred_roles || []);
  const targetLocations = typeof config.target_locations === 'string' ? JSON.parse(config.target_locations) : (config.target_locations || []);
  const minMatchScore = config.min_match_score || 70;

  // 3. Fetch active career sources (user-supplied)
  const [dbSources] = await pool.query("SELECT * FROM new_ai_career_sources WHERE user_id = ? AND status != 'invalid'", [userId]);
  const sources = [...dbSources];
  const knownUrls = new Set(sources.map((s) => (s.url || '').replace(/\/$/, '')));

  // 3b. Autonomous discovery: let the agent search the web for relevant career pages
  if (config.auto_discover) {
    addLog('Auto-discovery enabled. Searching the web for relevant career pages...', 'info');
    try {
      const discovered = await discoverCareerPages({ preferredRoles, targetLocations, addLog });
      for (const d of discovered) {
        const key = d.url.replace(/\/$/, '');
        if (knownUrls.has(key)) continue;
        knownUrls.add(key);
        // Ephemeral source (no DB id) - crawled this run, not persisted to the user's list
        sources.push({ id: null, url: d.url, source_type: 'discovered', ephemeral: true });
      }
    } catch (discErr) {
      addLog(`Auto-discovery failed: ${discErr.message}. Continuing with manual sources.`, 'warn');
    }
  }

  if (sources.length === 0) {
    addLog('No career sources to crawl. Enable auto-discovery or add career page URLs in the dashboard.', 'warn');
    return [];
  }

  addLog(`Prepared ${sources.length} career URLs to crawl.`, 'info');
  
  const discoveredJobsList = [];

  // 4. Crawling & ATS Scraping Phase
  for (const source of sources) {
    addLog(`Crawling source URL: ${source.url}`, 'info');
    
    const greenhouseToken = parseGreenhouseToken(source.url);
    const leverToken = parseLeverToken(source.url);
    
    let jobsScraped = [];

    try {
      if (greenhouseToken) {
        addLog(`Greenhouse ATS detected for company: "${greenhouseToken}". Fetching live job board API...`, 'info');
        const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${greenhouseToken}/jobs`, { signal: AbortSignal.timeout(6000) });
        
        if (res.ok) {
          const data = await res.json();
          const jobs = data.jobs || [];
          addLog(`Successfully scraped ${jobs.length} jobs via Greenhouse API.`, 'success');
          
          jobsScraped = jobs.map(j => ({
            company_name: greenhouseToken.charAt(0).toUpperCase() + greenhouseToken.slice(1),
            job_title: j.title,
            url: j.absolute_url,
            ats_type: 'greenhouse',
            job_type: j.departments && j.departments.length > 0 ? 'Full-time' : 'Contract',
            location: j.location ? j.location.name : 'Remote',
            description: j.title + ' position at ' + greenhouseToken,
            raw_content: JSON.stringify(j)
          }));
        } else {
          throw new Error(`Greenhouse API returned status ${res.status}`);
        }
      } else if (leverToken) {
        addLog(`Lever ATS detected for company: "${leverToken}". Fetching live postings API...`, 'info');
        const res = await fetch(`https://api.lever.co/v0/postings/${leverToken}?mode=json`, { signal: AbortSignal.timeout(6000) });
        
        if (res.ok) {
          const jobs = await res.json();
          addLog(`Successfully scraped ${jobs.length} jobs via Lever API.`, 'success');
          
          jobsScraped = jobs.map(j => ({
            company_name: leverToken.charAt(0).toUpperCase() + leverToken.slice(1),
            job_title: j.text,
            url: j.hostedUrl,
            ats_type: 'lever',
            job_type: j.categories && j.categories.commitment ? j.categories.commitment : 'Full-time',
            location: j.categories && j.categories.location ? j.categories.location : 'Remote',
            description: j.description || j.text + ' role',
            raw_content: JSON.stringify(j)
          }));
        } else {
          throw new Error(`Lever API returned status ${res.status}`);
        }
      } else {
        addLog(`Custom Corporate ATS detected. Rendering page with headless browser and extracting listings...`, 'info');
        jobsScraped = await scrapeCustomCareerPage(source.url, { preferredRoles, addLog });
        if (jobsScraped.length > 0) {
          addLog(`Browser scraper extracted ${jobsScraped.length} real jobs from custom page.`, 'success');
        }
      }

      // Update source status based on whether we actually reached/extracted anything
      // (only for persisted user sources; discovered ones are ephemeral)
      if (source.id) {
        const reachedStatus = jobsScraped.length > 0 ? 'active' : 'unreachable';
        await pool.query("UPDATE new_ai_career_sources SET status = ?, last_scraped_at = NOW() WHERE id = ?", [reachedStatus, source.id]);
      }

    } catch (err) {
      addLog(`Crawling failed for ${source.url}: ${err.message}. No jobs recorded for this source.`, 'warn');
      jobsScraped = [];
      if (source.id) {
        await pool.query("UPDATE new_ai_career_sources SET status = 'unreachable', last_scraped_at = NOW() WHERE id = ?", [source.id]);
      }
    }

    // Deduplication and database storage
    for (const scrapedJob of jobsScraped) {
      try {
        const [existing] = await pool.query("SELECT id FROM new_ai_discovered_jobs WHERE url = ?", [scrapedJob.url]);
        
        let jobId;
        if (existing.length > 0) {
          jobId = existing[0].id;
          await pool.query(`
            UPDATE new_ai_discovered_jobs
            SET job_title = ?, location = ?, description = ?
            WHERE id = ?
          `, [scrapedJob.job_title, scrapedJob.location, scrapedJob.description, jobId]);
        } else {
          const [insertRes] = await pool.query(`
            INSERT INTO new_ai_discovered_jobs (company_name, job_title, url, ats_type, job_type, location, description, raw_content)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [scrapedJob.company_name, scrapedJob.job_title, scrapedJob.url, scrapedJob.ats_type, scrapedJob.job_type, scrapedJob.location, scrapedJob.description, scrapedJob.raw_content]);
          jobId = insertRes.insertId;
        }
        
        scrapedJob.id = jobId;
        discoveredJobsList.push(scrapedJob);
      } catch (dbErr) {
        console.error('Save discovered job error:', dbErr);
      }
    }
  }

  addLog(`Crawling phase finished. Discovered ${discoveredJobsList.length} total jobs. Starting LLM match scoring...`, 'info');
  
  const finalMatches = [];

  // 5. Matching & Scoring Phase
  for (const job of discoveredJobsList) {
    addLog(`Evaluating match for "${job.job_title}" at "${job.company_name}"`, 'info');
    
    // Look up existing match score for deduplication
    const [existingMatches] = await pool.query("SELECT id FROM new_ai_matches WHERE user_id = ? AND discovered_job_id = ?", [userId, job.id]);
    if (existingMatches.length > 0) {
      addLog(`Match evaluation already completed for job ID: ${job.id}. Skipping...`, 'info');
      continue;
    }

    let matchResult;
    const scoringPrompt = `You are a Senior AI Recruiting Agent. Evaluate the match between a candidate profile and a job description.

CANDIDATE PROFILE:
- Title: ${candidate.job_title || 'Software Engineer'}
- Expected Salary: $${candidate.minimum_salary || '50000'}
- Skills: ${JSON.stringify(candidateSkills)}
- Experience: ${JSON.stringify(candidateExp)}
- Education: ${JSON.stringify(candidateEdu)}
- Targeted Roles: ${JSON.stringify(preferredRoles)}
- Target Locations: ${JSON.stringify(targetLocations)}

JOB DESCRIPTION:
- Title: ${job.job_title}
- Company: ${job.company_name}
- Location: ${job.location}
- Job Type: ${job.job_type}
- Description: ${job.description}

Score the match across 6 dimensions (each 1-5, where 5 is excellent), assign an overall letter grade, and assess the legitimacy of the posting (flag ghost jobs, expired listings, vague/suspicious descriptions, scams).

Return ONLY valid JSON (no markdown, no explanation) with these exact fields:
{
  "match_score": <integer 0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "recommendation_level": <"strong"|"good"|"low">,
  "reasoning_summary": <one sentence string>,
  "risk_factors": [<array of strings>],
  "missing_skills": [<array of strings>],
  "dimensions": {
    "role_match": { "score": <1-5>, "note": <short string> },
    "skills_alignment": { "score": <1-5>, "note": <short string> },
    "seniority_fit": { "score": <1-5>, "note": <short string> },
    "compensation": { "score": <1-5>, "note": <short string> },
    "location_feasibility": { "score": <1-5>, "note": <short string> },
    "company_stage": { "score": <1-5>, "note": <short string> }
  },
  "legitimacy": { "is_legit": <true|false>, "confidence": <"high"|"medium"|"low">, "flags": [<array of strings>] }
}`;

    // LLM scoring via shared helper (Groq primary -> Gemini -> Claude -> OpenAI)
    if (!matchResult) {
      addLog('Scoring match with LLM (Groq primary)...', 'info');
      const scored = await callLLMForJson(scoringPrompt, {
        system: 'You are a Senior AI Recruiting Agent. Return ONLY valid JSON.',
        maxTokens: 900,
        addLog
      });
      if (scored && typeof scored.match_score !== 'undefined') {
        matchResult = scored;
        addLog(`LLM scored "${job.job_title}" → ${matchResult.match_score}%`, 'success');
      } else {
        addLog('LLM scoring unavailable. Using heuristic fallback...', 'warn');
      }
    }

    // Heuristic Fallback
    if (!matchResult) {
      let score = 50;
      const missing_skills = [];
      const risk_factors = [];
      
      const jobTitleLower = job.job_title.toLowerCase();
      let roleMatch = false;
      for (const role of preferredRoles) {
        if (jobTitleLower.includes(role.toLowerCase())) {
          score += 25;
          roleMatch = true;
          break;
        }
      }
      if (!roleMatch) {
        risk_factors.push('Job title does not directly match targeted roles list.');
        score -= 10;
      }
      
      let skillMatches = 0;
      for (const skill of candidateSkills) {
        const sName = (skill && skill.name ? String(skill.name) : '').toLowerCase();
        if (!sName) continue;
        if (job.description.toLowerCase().includes(sName) || jobTitleLower.includes(sName)) {
          score += 8;
          skillMatches++;
        }
      }
      
      const possibleTech = ['AWS', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'Next.js', 'PostgreSQL', 'Java', 'Python'];
      for (const tech of possibleTech) {
        const tLower = tech.toLowerCase();
        const hasCandidate = candidateSkills.some(s => s && s.name && String(s.name).toLowerCase().includes(tLower));
        const hasJob = job.description.toLowerCase().includes(tLower) || jobTitleLower.includes(tLower);
        
        if (hasJob && !hasCandidate) {
          missing_skills.push(tech);
          score -= 5;
        }
      }
      
      const locationLower = job.location.toLowerCase();
      const isRemoteJob = locationLower.includes('remote') || locationLower.includes('anywhere');
      const prefersRemote = targetLocations.some(l => l.toLowerCase().includes('remote'));
      
      if (isRemoteJob && prefersRemote) {
        score += 15;
      } else if (!isRemoteJob) {
        let cityMatch = false;
        for (const loc of targetLocations) {
          if (locationLower.includes(loc.toLowerCase())) {
            score += 10;
            cityMatch = true;
            break;
          }
        }
        if (!cityMatch) {
          risk_factors.push(`Job location "${job.location}" is outside target geographical scope.`);
          score -= 15;
        }
      }

      score = Math.max(10, Math.min(99, score));
      
      let recommendation_level = 'low';
      if (score >= 85) {
        recommendation_level = 'strong';
      } else if (score >= 70) {
        recommendation_level = 'good';
      }

      const reasoning = `Candidate profile evaluated against job details. Score weighted at ${score}/100. Recommendation level set to "${recommendation_level}".`;

      matchResult = {
        match_score: score,
        recommendation_level,
        reasoning_summary: reasoning,
        risk_factors,
        missing_skills
      };
    }

    // Normalize into a complete evaluation (dimensions + grade + legitimacy)
    const evaluation = normalizeEvaluation(matchResult);
    matchResult.risk_factors = Array.isArray(matchResult.risk_factors) ? matchResult.risk_factors : [];
    matchResult.missing_skills = Array.isArray(matchResult.missing_skills) ? matchResult.missing_skills : [];

    // Surface a legitimacy problem as a risk factor so it's visible
    if (!evaluation.legitimacy.is_legit) {
      const flagText = evaluation.legitimacy.flags.length ? evaluation.legitimacy.flags.join('; ') : 'Posting flagged as potentially illegitimate (ghost/expired/suspicious).';
      addLog(`⚠ Legitimacy concern for "${job.job_title}": ${flagText}`, 'warn');
      matchResult.risk_factors = [`Legitimacy: ${flagText}`, ...matchResult.risk_factors];
    }

    // Save Match Results
    if (matchResult.match_score >= minMatchScore) {
      try {
        await pool.query(`
          INSERT INTO new_ai_matches (user_id, discovered_job_id, match_score, recommendation_level, reasoning_summary, risk_factors, missing_skills, evaluation)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          job.id,
          matchResult.match_score,
          matchResult.recommendation_level,
          matchResult.reasoning_summary,
          JSON.stringify(matchResult.risk_factors),
          JSON.stringify(matchResult.missing_skills),
          JSON.stringify(evaluation)
        ]);

        addLog(`✓ Saved match (${matchResult.match_score}%, grade ${evaluation.grade}) for "${job.job_title}"`, 'success');

        finalMatches.push({
          job_title: job.job_title,
          company_name: job.company_name,
          location: job.location,
          url: job.url,
          match_score: matchResult.match_score,
          recommendation_level: matchResult.recommendation_level,
          reasoning_summary: matchResult.reasoning_summary,
          missing_skills: matchResult.missing_skills,
          risk_factors: matchResult.risk_factors,
          evaluation
        });

      } catch (matchDbErr) {
        console.error('Save match record error:', matchDbErr);
      }
    } else {
      addLog(`Rejected low match opportunity (${matchResult.match_score}%, grade ${evaluation.grade}): "${job.job_title}"`, 'info');
    }
  }

  return finalMatches;
}
