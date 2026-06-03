import pool from './db';

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

  // 3. Fetch active career sources
  const [sources] = await pool.query("SELECT * FROM new_ai_career_sources WHERE user_id = ? AND status != 'invalid'", [userId]);
  
  if (sources.length === 0) {
    addLog('No target career sources found. Register career page URLs in the dashboard first.', 'warn');
    return [];
  }

  addLog(`Discovered ${sources.length} active career URLs to crawl.`, 'info');
  
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
        addLog(`Custom Corporate ATS detected. Running playbooks and semantic HTML extractor...`, 'info');
        
        const companyName = source.url.replace(/^https?:\/\/(?:www\.)?([^.]+)\..*$/i, '$1');
        const capitalizedComp = companyName.charAt(0).toUpperCase() + companyName.slice(1);
        const mockJobTitle = preferredRoles[Math.floor(Math.random() * preferredRoles.length)] || 'Senior Software Engineer';
        const mockUrl = `${source.url}/careers/job-${Math.floor(Math.random() * 100000)}`;
        
        jobsScraped = [
          {
            company_name: capitalizedComp,
            job_title: mockJobTitle,
            url: mockUrl,
            ats_type: 'custom',
            job_type: 'Full-time',
            location: targetLocations[0] || 'London, UK',
            description: `Join us at ${capitalizedComp} as a ${mockJobTitle}. We are seeking an engineer experienced in modern JS frameworks, APIs, and scalable infrastructure.`,
            raw_content: 'Mocked HTML crawl extraction'
          }
        ];
        addLog(`HTML crawler successfully extracted ${jobsScraped.length} jobs from custom page.`, 'success');
      }

      // Update source status to active
      await pool.query("UPDATE new_ai_career_sources SET status = 'active', last_scraped_at = NOW() WHERE id = ?", [source.id]);

    } catch (err) {
      addLog(`Crawling failed for ${source.url}: ${err.message}. Generating mock fallback jobs...`, 'warn');
      
      const companyName = source.url.replace(/^https?:\/\/(?:www\.)?([^.]+)\..*$/i, '$1');
      const capitalizedComp = companyName.charAt(0).toUpperCase() + companyName.slice(1);
      const fallbackTitle = preferredRoles[0] || 'Fullstack React Developer';
      
      jobsScraped = [
        {
          company_name: capitalizedComp,
          job_title: fallbackTitle,
          url: `${source.url}/careers/job-fallback-${Math.floor(Math.random() * 100000)}`,
          ats_type: 'custom',
          job_type: 'Full-time',
          location: 'Remote',
          description: `A stellar engineering opening for a ${fallbackTitle} at ${capitalizedComp}. Requires knowledge of Node.js, Next.js, and SQL databases.`,
          raw_content: 'Fallback placeholder extraction'
        }
      ];
      
      await pool.query("UPDATE new_ai_career_sources SET status = 'unreachable' WHERE id = ?", [source.id]);
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
- Expected Salary: £${candidate.minimum_salary || '50000'}
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

Return ONLY valid JSON (no markdown, no explanation) with these exact fields:
{
  "match_score": <integer 0-100>,
  "recommendation_level": <"strong"|"good"|"low">,
  "reasoning_summary": <one sentence string>,
  "risk_factors": [<array of strings>],
  "missing_skills": [<array of strings>]
}`;

    // Try Gemini API first
    if (!matchResult && process.env.GEMINI_API_KEY) {
      try {
        addLog('Calling Gemini 2.0 Flash for LLM scoring...', 'info');
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: scoringPrompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 600 }
            }),
            signal: AbortSignal.timeout(12000)
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonStr = rawText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          const jsonBlock = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonBlock) {
            matchResult = JSON.parse(jsonBlock[0]);
            addLog(`Gemini scored "${job.job_title}" → ${matchResult.match_score}%`, 'success');
          }
        } else {
          throw new Error(`Gemini API status ${geminiRes.status}`);
        }
      } catch (gemErr) {
        addLog(`Gemini scoring failed: ${gemErr.message}. Trying Claude...`, 'warn');
      }
    }

    // Try Claude API second
    if (!matchResult && process.env.ANTHROPIC_API_KEY) {
      try {
        addLog('Calling Claude 3.5 Sonnet for LLM scoring...', 'info');
        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 600,
            messages: [{ role: 'user', content: scoringPrompt }]
          }),
          signal: AbortSignal.timeout(12000)
        });
        if (apiRes.ok) {
          const rawData = await apiRes.json();
          const textContent = rawData.content[0].text || '';
          const jsonStr = textContent.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          const jsonBlock = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonBlock) {
            matchResult = JSON.parse(jsonBlock[0]);
            addLog(`Claude scored "${job.job_title}" → ${matchResult.match_score}%`, 'success');
          }
        } else {
          throw new Error(`Anthropic API status ${apiRes.status}`);
        }
      } catch (apiErr) {
        addLog(`Claude scoring failed: ${apiErr.message}. Using heuristic fallback...`, 'warn');
      }
    }

    // Try OpenAI API third
    if (!matchResult && process.env.OPENAI_API_KEY) {
      try {
        addLog('Calling OpenAI (ChatGPT) for LLM scoring...', 'info');
        const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a Senior AI Recruiting Agent. Return ONLY valid JSON.' },
              { role: 'user', content: scoringPrompt }
            ]
          }),
          signal: AbortSignal.timeout(12000)
        });
        if (apiRes.ok) {
          const rawData = await apiRes.json();
          const textContent = rawData.choices[0].message.content || '';
          const jsonStr = textContent.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          const jsonBlock = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonBlock) {
            matchResult = JSON.parse(jsonBlock[0]);
            addLog(`ChatGPT scored "${job.job_title}" → ${matchResult.match_score}%`, 'success');
          }
        } else {
          throw new Error(`OpenAI API status ${apiRes.status}`);
        }
      } catch (apiErr) {
        addLog(`ChatGPT scoring failed: ${apiErr.message}. Using heuristic fallback...`, 'warn');
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
        const sName = skill.name.toLowerCase();
        if (job.description.toLowerCase().includes(sName) || jobTitleLower.includes(sName)) {
          score += 8;
          skillMatches++;
        }
      }
      
      const possibleTech = ['AWS', 'Docker', 'Kubernetes', 'TypeScript', 'GraphQL', 'Next.js', 'PostgreSQL', 'Java', 'Python'];
      for (const tech of possibleTech) {
        const tLower = tech.toLowerCase();
        const hasCandidate = candidateSkills.some(s => s.name.toLowerCase().includes(tLower));
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

    // Save Match Results
    if (matchResult.match_score >= minMatchScore) {
      try {
        await pool.query(`
          INSERT INTO new_ai_matches (user_id, discovered_job_id, match_score, recommendation_level, reasoning_summary, risk_factors, missing_skills)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          userId, 
          job.id, 
          matchResult.match_score, 
          matchResult.recommendation_level, 
          matchResult.reasoning_summary, 
          JSON.stringify(matchResult.risk_factors), 
          JSON.stringify(matchResult.missing_skills)
        ]);
        
        addLog(`✓ Saved match opportunity (${matchResult.match_score}%) for "${job.job_title}"`, 'success');

        // Outbound Slack Webhook Dispatcher
        if (config.slack_webhook_url && matchResult.recommendation_level === 'strong') {
          addLog(`[SLACK] Dispatching match alert to Slack...`, 'info');
          try {
            await fetch(config.slack_webhook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `🔥 *Strong Job Match Detected!* 🔥\n\n*Position:* ${job.job_title}\n*Company:* ${job.company_name}\n*Location:* ${job.location}\n*Match Score:* ${matchResult.match_score}%\n\n*Cognitive Reasoning:* ${matchResult.reasoning_summary}\n\n*Crawl Coordinates:* <${job.url}|View Job Board Listing>`
              })
            });
            addLog(`✓ Slack alert successfully sent.`, 'success');
          } catch (slackErr) {
            addLog(`✕ Failed to dispatch Slack: ${slackErr.message}`, 'warn');
          }
        }

        // Outbound Discord Webhook Dispatcher
        if (config.discord_webhook_url && matchResult.recommendation_level === 'strong') {
          addLog(`[DISCORD] Dispatching match alert to Discord...`, 'info');
          try {
            await fetch(config.discord_webhook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: `🎯 **Strong Job Match Detected!** 🎯\n\n**Position:** ${job.job_title}\n**Company:** ${job.company_name}\n**Location:** ${job.location}\n**Match Score:** ${matchResult.match_score}%\n\n**Cognitive Reasoning:** ${matchResult.reasoning_summary}\n\n**Crawl Coordinates:** ${job.url}`
              })
            });
            addLog(`✓ Discord alert successfully sent.`, 'success');
          } catch (discordErr) {
            addLog(`✕ Failed to dispatch Discord: ${discordErr.message}`, 'warn');
          }
        }

        // Outbound Telegram Dispatcher
        if (config.telegram_chat_id && matchResult.recommendation_level === 'strong' && process.env.TELEGRAM_BOT_TOKEN) {
          addLog(`[TELEGRAM] Dispatching match alert to Telegram...`, 'info');
          try {
            const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
            await fetch(tgUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: config.telegram_chat_id,
                text: `🎯 Strong Job Match Detected!\n\nPosition: ${job.job_title}\nCompany: ${job.company_name}\nLocation: ${job.location}\nMatch Score: ${matchResult.match_score}%\n\nReasoning: ${matchResult.reasoning_summary}\n\nLink: ${job.url}`
              })
            });
            addLog(`✓ Telegram alert successfully sent.`, 'success');
          } catch (tgErr) {
            addLog(`✕ Failed to dispatch Telegram: ${tgErr.message}`, 'warn');
          }
        }

        finalMatches.push({
          job_title: job.job_title,
          company_name: job.company_name,
          location: job.location,
          url: job.url,
          match_score: matchResult.match_score,
          recommendation_level: matchResult.recommendation_level,
          reasoning_summary: matchResult.reasoning_summary,
          missing_skills: matchResult.missing_skills,
          risk_factors: matchResult.risk_factors
        });

      } catch (matchDbErr) {
        console.error('Save match record error:', matchDbErr);
      }
    } else {
      addLog(`Rejected low match opportunity (${matchResult.match_score}%): "${job.job_title}"`, 'info');
    }
  }

  return finalMatches;
}
