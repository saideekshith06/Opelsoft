// Standalone smoke test for the custom-page scraper.
//
//   node scripts/test_scraper.mjs <career-page-url>
//
// Renders the page with Playwright and prints the extracted jobs. Works with or
// without LLM keys (falls back to the heuristic DOM parser when no key is set).

import { createRequire } from 'module';
import fs from 'fs';

// The scraper module uses a runtime `require('playwright')` (to satisfy the Next
// bundler). Provide a working `require` in this standalone ESM context.
globalThis.require = createRequire(import.meta.url);

// Load .env.local so GROQ_API_KEY / GROQ_MODEL etc. are available (same pattern as
// the other scripts).
if (fs.existsSync('.env.local')) {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  });
}

const url = process.argv[2] || 'https://www.ycombinator.com/companies?role=engineering';

const { scrapeCustomCareerPage, closeScraperBrowser } = await import('../src/lib/scraper.js');

console.log(`\n--- SCRAPER SMOKE TEST ---`);
console.log(`Target: ${url}`);
console.log(`LLM provider configured: ${
  process.env.GROQ_API_KEY ? 'Groq' :
  process.env.GEMINI_API_KEY ? 'Gemini' :
  process.env.OPENAI_API_KEY ? 'OpenAI' :
  process.env.ANTHROPIC_API_KEY ? 'Claude' : 'none (heuristic fallback)'
}\n`);

const addLog = (message, type = 'info') => console.log(`[${type.toUpperCase()}] ${message}`);

try {
  const jobs = await scrapeCustomCareerPage(url, { preferredRoles: ['Software Engineer', 'Developer'], addLog });
  console.log(`\n--- RESULT: ${jobs.length} job(s) extracted ---`);
  jobs.slice(0, 15).forEach((j, i) => {
    console.log(`${i + 1}. ${j.job_title}  |  ${j.location}  |  ${j.job_type}\n   ${j.url}`);
  });
  if (jobs.length === 0) {
    console.log('(No jobs found — this is the honest "no fabrication" result.)');
  }
} catch (err) {
  console.error('Test threw (should not happen — scraper is meant to swallow errors):', err);
} finally {
  await closeScraperBrowser();
  console.log('\nBrowser closed. Done.');
}
