// Autonomous discovery of relevant company career pages.
//
// Two complementary, optional sources (both fail gracefully):
//   1. Groq compound model — has built-in web search; stays within the Groq key.
//   2. SerpApi (Google engine) — used only when SERPAPI_API_KEY is set.
//
// Returns a deduped list of { url, company } career-page candidates that the
// existing scraper can then crawl.

// compound-mini does a single web search (smaller context) — fits the free tier,
// where full `groq/compound` can hit 413/429. Override via GROQ_COMPOUND_MODEL.
const GROQ_COMPOUND_MODEL = process.env.GROQ_COMPOUND_MODEL || 'groq/compound-mini';
const DISCOVERY_MAX_URLS = process.env.DISCOVERY_MAX_URLS ? parseInt(process.env.DISCOVERY_MAX_URLS, 10) : 12;
// Compound runs several web searches server-side, so allow a longer budget.
const COMPOUND_TIMEOUT_MS = process.env.DISCOVERY_TIMEOUT_MS ? parseInt(process.env.DISCOVERY_TIMEOUT_MS, 10) : 70000;

// Hosts/paths that strongly indicate a real careers/jobs page.
const CAREER_HINTS = ['careers', 'career', 'jobs', 'greenhouse.io', 'lever.co', 'ashbyhq.com', 'workable.com', 'bamboohr.com', 'join.com', 'workday'];
// Aggregators / noise we don't want to crawl as a single company source.
const BLOCKLIST = ['wikipedia.org', 'linkedin.com/jobs', 'indeed.', 'glassdoor.', 'reddit.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com'];

function looksLikeCareerUrl(url) {
  const u = url.toLowerCase();
  if (BLOCKLIST.some((b) => u.includes(b))) return false;
  return CAREER_HINTS.some((h) => u.includes(h));
}

function normalizeUrl(raw) {
  try {
    let s = String(raw).trim();
    if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
    const url = new URL(s);
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function extractJsonArray(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
  const block = cleaned.match(/\[[\s\S]*\]/);
  if (!block) return null;
  try { return JSON.parse(block[0]); } catch { return null; }
}

function buildQueries(roles, locations) {
  const roleList = (roles && roles.length ? roles : ['Software Engineer']).slice(0, 3);
  const locList = (locations && locations.length ? locations : ['Remote']).slice(0, 2);
  const queries = [];
  for (const role of roleList) {
    for (const loc of locList) {
      queries.push(`companies hiring ${role} in ${loc} careers page`);
    }
  }
  return queries.slice(0, 4);
}

// --- Source 1: Groq compound (web search built in) ---
async function discoverViaGroqCompound(roles, locations, log) {
  if (!process.env.GROQ_API_KEY) return [];
  const prompt = `You have web access. Find real companies that are currently hiring for these roles: ${JSON.stringify(roles)} in these locations: ${JSON.stringify(locations)}.
For each, find the company's official careers/jobs page URL (prefer Greenhouse, Lever, Ashby, or the company's own /careers page; avoid aggregators like LinkedIn, Indeed, Glassdoor).
Return ONLY a JSON array (no prose) of up to ${DISCOVERY_MAX_URLS} objects: [{ "company": "string", "careers_url": "https://..." }].`;

  try {
    log(`Discovery: querying Groq compound (${GROQ_COMPOUND_MODEL}) with web search...`, 'info');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_COMPOUND_MODEL,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a job-search research agent with web access. Return only the requested JSON.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(COMPOUND_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Groq compound status ${res.status}`);
    const data = await res.json();
    const arr = extractJsonArray(data?.choices?.[0]?.message?.content || '');
    if (!Array.isArray(arr)) {
      log('Discovery: Groq compound returned no parseable list.', 'warn');
      return [];
    }
    const out = arr
      .map((o) => ({ url: normalizeUrl(o.careers_url || o.url), company: o.company || '' }))
      .filter((o) => o.url);
    log(`Discovery: Groq compound suggested ${out.length} URLs.`, 'success');
    return out;
  } catch (err) {
    log(`Discovery: Groq compound failed: ${err.message}`, 'warn');
    return [];
  }
}

// --- Source 2: SerpApi (Google) ---
async function discoverViaSerpApi(roles, locations, log) {
  if (!process.env.SERPAPI_API_KEY) return [];
  const queries = buildQueries(roles, locations);
  const found = [];
  for (const q of queries) {
    try {
      log(`Discovery: SerpApi Google search "${q}"...`, 'info');
      const url = `https://serpapi.com/search?engine=google&num=10&q=${encodeURIComponent(q)}&api_key=${process.env.SERPAPI_API_KEY}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`SerpApi status ${res.status}`);
      const data = await res.json();
      const organic = Array.isArray(data.organic_results) ? data.organic_results : [];
      for (const r of organic) {
        const norm = normalizeUrl(r.link);
        if (norm && looksLikeCareerUrl(norm)) {
          found.push({ url: norm, company: r.title || '' });
        }
      }
    } catch (err) {
      log(`Discovery: SerpApi query failed: ${err.message}`, 'warn');
    }
  }
  log(`Discovery: SerpApi yielded ${found.length} career-like URLs.`, found.length ? 'success' : 'warn');
  return found;
}

// --- Source 3: DuckDuckGo (no API key) parsed with Cheerio ---
async function discoverViaDuckDuckGo(roles, locations, log) {
  const queries = buildQueries(roles, locations);
  const found = [];
  let load;
  try {
    ({ load } = await import('cheerio'));
  } catch (e) {
    log(`Discovery: cheerio unavailable (${e.message}); skipping DuckDuckGo.`, 'warn');
    return [];
  }

  for (const q of queries) {
    try {
      log(`Discovery: DuckDuckGo search "${q}"...`, 'info');
      // The /html endpoint returns plain server-rendered results (no JS, no key).
      const res = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        },
        body: `q=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`DuckDuckGo status ${res.status}`);
      const html = await res.text();
      const $ = load(html);
      $('a.result__a').each((_, el) => {
        let href = $(el).attr('href') || '';
        // DDG wraps links as //duckduckgo.com/l/?uddg=<encoded real url>
        const m = href.match(/[?&]uddg=([^&]+)/);
        if (m) href = decodeURIComponent(m[1]);
        const norm = normalizeUrl(href);
        if (norm && looksLikeCareerUrl(norm)) {
          found.push({ url: norm, company: $(el).text().trim() });
        }
      });
    } catch (err) {
      log(`Discovery: DuckDuckGo query failed: ${err.message}`, 'warn');
    }
  }
  log(`Discovery: DuckDuckGo yielded ${found.length} career-like URLs.`, found.length ? 'success' : 'warn');
  return found;
}

/**
 * Discover relevant career-page URLs for a candidate's preferences.
 * @param {object} opts
 * @param {string[]} opts.preferredRoles
 * @param {string[]} opts.targetLocations
 * @param {function} [opts.addLog]
 * @returns {Promise<Array<{url:string, company:string}>>}
 */
export async function discoverCareerPages(opts = {}) {
  const { preferredRoles = [], targetLocations = [], addLog } = opts;
  const log = typeof addLog === 'function' ? addLog : () => {};

  const [groqUrls, serpUrls, ddgUrls] = await Promise.all([
    discoverViaGroqCompound(preferredRoles, targetLocations, log),
    discoverViaSerpApi(preferredRoles, targetLocations, log),
    discoverViaDuckDuckGo(preferredRoles, targetLocations, log),
  ]);

  // Merge + dedup by URL (Groq first, then SerpApi, then DuckDuckGo)
  const seen = new Set();
  const merged = [];
  for (const item of [...groqUrls, ...serpUrls, ...ddgUrls]) {
    if (!item.url || seen.has(item.url)) continue;
    seen.add(item.url);
    merged.push(item);
    if (merged.length >= DISCOVERY_MAX_URLS) break;
  }

  if (merged.length === 0) {
    log('Discovery: no career pages found (no GROQ/SERPAPI access or empty results).', 'warn');
  } else {
    log(`Discovery: ${merged.length} career page(s) ready to crawl.`, 'success');
  }
  return merged;
}
