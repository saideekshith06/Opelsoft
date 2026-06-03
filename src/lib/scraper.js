// Playwright-backed scraper for custom (non-Greenhouse/non-Lever) career pages.
// Renders the page in a real browser so JavaScript-rendered listings are visible,
// then extracts a structured job list via the shared LLM helper, with a heuristic
// DOM fallback. Never throws to the caller and never fabricates jobs — returns []
// when it cannot find anything.

import { callLLMForJson } from './llm.js';

const SCRAPER_TIMEOUT_MS = process.env.SCRAPER_TIMEOUT_MS ? parseInt(process.env.SCRAPER_TIMEOUT_MS, 10) : 20000;
const SCRAPER_MAX_JOBS = process.env.SCRAPER_MAX_JOBS ? parseInt(process.env.SCRAPER_MAX_JOBS, 10) : 25;
const MAX_CONTENT_CHARS = 12000;

// Cache the browser on global so a single instance is reused across all sources
// in one pipeline run (and survives dev hot-reloads), rather than relaunching.
function getBrowserHolder() {
  if (!global.__opelScraper) {
    global.__opelScraper = { browser: null };
  }
  return global.__opelScraper;
}

async function getBrowser() {
  const holder = getBrowserHolder();
  if (holder.browser && holder.browser.isConnected()) {
    return holder.browser;
  }
  // Lazy require to avoid Turbopack ESM bundling issues (mirrors pdf-parse handling).
  const { chromium } = require('playwright');
  holder.browser = await chromium.launch({ headless: true });
  return holder.browser;
}

/** Close the cached browser if one is open. Safe to call when none exists. */
export async function closeScraperBrowser() {
  const holder = getBrowserHolder();
  if (holder.browser) {
    try {
      await holder.browser.close();
    } catch {
      // ignore — best effort
    }
    holder.browser = null;
  }
}

function companyNameFromUrl(url) {
  const name = url.replace(/^https?:\/\/(?:www\.)?([^.]+)\..*$/i, '$1');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function toAbsoluteUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Extract a condensed representation of the page: visible text plus a list of anchors.
 * Runs in the browser context.
 */
async function extractPageData(page) {
  return page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim().replace(/\s+/g, ' ') }))
      .filter((a) => a.href && a.text);
    const bodyText = (document.body ? document.body.innerText : '').replace(/\s+\n/g, '\n').trim();
    return { anchors, bodyText, title: document.title || '' };
  });
}

/** Build the LLM prompt from the condensed page data. */
function buildExtractionPrompt(pageData, sourceUrl) {
  const anchorLines = pageData.anchors
    .slice(0, 200)
    .map((a) => `- ${a.text} => ${a.href}`)
    .join('\n');
  const body = pageData.bodyText.slice(0, MAX_CONTENT_CHARS);

  return `You are a precise web scraping assistant. Below is the rendered content of a company's careers/jobs web page. Extract the distinct job openings listed on it.

PAGE URL: ${sourceUrl}
PAGE TITLE: ${pageData.title}

LINKS ON PAGE (text => href):
${anchorLines}

VISIBLE PAGE TEXT (truncated):
${body}

Return ONLY a valid JSON object (no markdown) of the form:
{
  "jobs": [
    { "job_title": "string", "location": "string or empty", "url": "string (absolute or relative href to the posting, or the page URL if unknown)", "job_type": "Full-time|Part-time|Contract|Internship|Remote or empty" }
  ]
}
Only include real job postings. If there are none, return {"jobs": []}.`;
}

/** Heuristic fallback: pick anchors that look like job postings. */
function heuristicExtract(pageData, sourceUrl, preferredRoles) {
  const roleWords = (preferredRoles || []).map((r) => String(r).toLowerCase());
  const jobHints = ['job', 'career', 'position', 'opening', 'vacancy', 'role', 'apply', 'engineer', 'developer', 'manager', 'designer', 'analyst'];
  const seen = new Set();
  const jobs = [];

  for (const a of pageData.anchors) {
    const text = a.text;
    const lowerText = text.toLowerCase();
    const lowerHref = a.href.toLowerCase();
    if (text.length < 3 || text.length > 120) continue;

    const looksLikeJob =
      jobHints.some((h) => lowerText.includes(h) || lowerHref.includes(h)) ||
      roleWords.some((r) => r && lowerText.includes(r));
    if (!looksLikeJob) continue;

    const abs = toAbsoluteUrl(a.href, sourceUrl);
    if (!abs || seen.has(abs)) continue;
    seen.add(abs);
    jobs.push({ job_title: text, location: '', url: abs, job_type: '' });
  }
  return jobs;
}

/**
 * Scrape a custom career page and return discovered jobs in the shape agentRunner stores.
 * @param {string} url
 * @param {object} [opts]
 * @param {string[]} [opts.preferredRoles]
 * @param {function} [opts.addLog]
 * @returns {Promise<Array>} jobs (empty on failure / none found; never throws)
 */
export async function scrapeCustomCareerPage(url, opts = {}) {
  const { preferredRoles = [], addLog } = opts;
  const log = typeof addLog === 'function' ? addLog : () => {};
  const companyName = companyNameFromUrl(url);

  let context;
  let page;
  try {
    const browser = await getBrowser();
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    });
    page = await context.newPage();

    log(`Rendering custom career page in headless browser: ${url}`, 'info');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: SCRAPER_TIMEOUT_MS });
    // Give client-side rendering a moment to populate listings.
    await page.waitForTimeout(1500);

    const pageData = await extractPageData(page);
    log(`Rendered page: ${pageData.anchors.length} links, ${pageData.bodyText.length} chars of text.`, 'info');

    // Primary: LLM extraction
    let rawJobs = [];
    const llmResult = await callLLMForJson(buildExtractionPrompt(pageData, url), { maxTokens: 1500, addLog });
    if (llmResult && Array.isArray(llmResult.jobs)) {
      rawJobs = llmResult.jobs;
      log(`LLM extracted ${rawJobs.length} candidate jobs.`, 'success');
    } else {
      // Fallback: DOM heuristics
      rawJobs = heuristicExtract(pageData, url, preferredRoles);
      log(`LLM extraction unavailable; heuristic parser found ${rawJobs.length} candidate jobs.`, 'warn');
    }

    // Normalize, resolve URLs, dedup, cap
    const seen = new Set();
    const jobs = [];
    for (const j of rawJobs) {
      const title = (j.job_title || '').toString().trim();
      if (!title) continue;
      const abs = toAbsoluteUrl((j.url || '').toString(), url) || url;
      if (seen.has(abs)) continue;
      seen.add(abs);
      jobs.push({
        company_name: companyName,
        job_title: title,
        url: abs,
        ats_type: 'custom',
        job_type: (j.job_type || 'Full-time').toString() || 'Full-time',
        location: (j.location || 'Not specified').toString(),
        description: `${title} role at ${companyName}.`,
        raw_content: 'Playwright-rendered custom career page extraction',
      });
      if (jobs.length >= SCRAPER_MAX_JOBS) {
        log(`Reached SCRAPER_MAX_JOBS cap (${SCRAPER_MAX_JOBS}); remaining listings on this page were not processed.`, 'warn');
        break;
      }
    }

    if (jobs.length === 0) {
      log(`No job listings could be extracted from ${url}.`, 'warn');
    }
    return jobs;
  } catch (err) {
    log(`Custom page scrape failed for ${url}: ${err.message}`, 'warn');
    return [];
  } finally {
    try {
      if (page) await page.close();
      if (context) await context.close();
    } catch {
      // ignore cleanup errors
    }
  }
}
