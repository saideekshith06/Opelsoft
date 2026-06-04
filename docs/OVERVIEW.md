# Opelsoft — Product Overview

Opelsoft is an **AI-powered job portal and autonomous recruiting platform**. Think
"LinkedIn Jobs" combined with a personal AI recruiting agent that goes out, finds
relevant jobs across the web, scores them against your profile, and surfaces the
best matches — automatically.

It serves two kinds of users:

- **Candidates** — build a profile, upload a CV, and let an AI agent discover and
  rank jobs for them.
- **Employers** — post jobs and manage applicants through a hiring pipeline.

---

## Who it's for and why it's useful

| Problem today | What Opelsoft does |
|---|---|
| Job seekers manually search dozens of company career pages | An AI agent **searches the web and scrapes those pages for you** |
| Hard to know which postings are worth applying to | Every job is **scored A–F across 6 dimensions** against your profile |
| Job boards are full of ghost/expired/scam listings | A **legitimacy check** flags suspicious postings |
| Filling in a profile from a CV is tedious | **Upload a PDF CV** and AI auto-fills your skills, experience, education |
| Employers drown in applicant tracking | A clean **applicant pipeline** with status stages |

---

## Core features

### 1. Accounts & authentication
- Register/login as **Candidate** or **Employer**.
- Secure sessions: passwords hashed with Node `scrypt`; signed JWT stored in an
  httpOnly cookie. Role-based access on every protected route.
- **Useful because:** each user only sees and edits their own data, safely.

### 2. Candidate profile & CV
- Edit job title, phone, salary expectation, cover letter, social links.
- Manage **skills (with proficiency %)**, **education**, and **work history**.
- **AI Resume Auto-Fill:** upload a PDF/Text CV — the app extracts the text and an
  LLM (Groq) parses it into structured profile fields you can review and save.
- **Useful because:** a complete, structured profile is what powers accurate AI
  job matching — and the CV upload makes building it a 10-second task.

### 3. Public job board
- Browse all employer-posted jobs (`/jobs`) and view individual listings
  (`/jobs/[id]`), then apply with a cover letter via a modal.
- **Useful because:** the classic, familiar job-search experience still exists
  alongside the AI agent.

### 4. The AI Recruiting Agent ("KAI") — the headline feature
This is the autonomous core. For each candidate it runs a pipeline:

1. **Auto-discovery** *(new)* — from your preferred roles + locations, the agent
   **searches the web** (Groq's `compound-mini` model with built-in web search, and
   optionally SerpApi/Google) to **find real company career pages** — no need to
   paste URLs yourself. You can still add specific URLs as an override.
2. **Scraping** — for each career page it uses the right method:
   - **Greenhouse** and **Lever** via their official JSON APIs (fast, reliable).
   - **Any other ("custom") career page** via a real **headless browser
     (Playwright)** that renders JavaScript, then an LLM extracts the job listings.
   - If a page can't be read, it records **nothing** — no fabricated jobs.
3. **Multi-dimensional scoring** *(new)* — every job is scored **0–100 with an
   A–F grade** across **6 dimensions**: role match, skills alignment, seniority fit,
   compensation vs. market, location feasibility, and company stage. You also get a
   one-line reasoning summary, **missing skills**, and **risk factors**.
4. **Legitimacy check** *(new)* — the agent flags **ghost jobs, expired listings,
   and suspicious/scam postings** so you don't waste time.
5. **Storage & display** — matches above your chosen threshold appear in the
   dashboard with the grade badge, per-dimension ratings, and an Apply link.

- **Config you control:** turn the agent on/off, set a **minimum match-score
  threshold**, manage **preferred roles** and **target locations**, and toggle
  **auto-discovery**.
- **Run it manually** with one click, or on a schedule via a secured cron endpoint.
- **Useful because:** it replaces hours of manual searching and triage with a
  ranked, vetted shortlist tailored to you.

### 5. Employer dashboard
- Post new job listings.
- See all your jobs and the applicants for each.
- Move applicants through hiring stages (in-progress → shortlisted → contacted →
  rejected → selected → hired). Only the employer who owns a job can change its
  applicants' status.
- **Useful because:** it's a lightweight applicant tracking system built in.

---

## How the AI works (plain-English)

All AI runs on **Groq** (fast, low-cost inference) using Llama 3.3 for parsing/
scoring and `compound-mini` for web-search discovery. Every AI step has a
**non-AI fallback** so the app keeps working even if the AI is unavailable:

- Resume parsing → falls back to a heuristic profile.
- Job extraction → falls back to a DOM/link heuristic.
- Job scoring → falls back to a rule-based scorer.

This means **no fake data and no hard failures** — you always get an honest result.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) — JavaScript |
| Styling | Vanilla CSS (`globals.css`) |
| Database | MySQL / **TiDB Serverless** via `mysql2` |
| Auth | Custom scrypt + JWT (no external auth lib) |
| AI | **Groq** (Llama 3.3 + compound-mini web search) |
| Scraping | **Playwright** (headless Chromium) |
| Search/discovery | Groq compound web search + optional **SerpApi** (Google) |
| PDF parsing | `pdf-parse` v2 + `@napi-rs/canvas` |

---

## Running it

```bash
npm install
npx playwright install chromium      # one-time: browser for scraping
node scripts/setup_tidb.js           # create DB schema on TiDB
npm run dev                          # http://localhost:3000
```

Environment (`.env.local`): `GROQ_API_KEY` (required for AI), `DB_*` (TiDB),
`JWT_SECRET`, and optionally `SERPAPI_API_KEY` for stronger discovery.

### Test scripts
| Command | Checks |
|---|---|
| `node scripts/setup_tidb.js` | DB connectivity + schema |
| `node scripts/test_pages.js` | All pages return 200 (needs dev server) |
| `node scripts/test_auth.js` | Register/login/session/logout (needs dev server) |
| `node scripts/test_scraper.mjs <url>` | Browser scrape + AI extraction |
| `node scripts/test_discovery.mjs` | Web-search career-page discovery |
| `node scripts/test_agent_e2e.mjs` | Full agent pipeline over HTTP |

---

## Current limitations (good to know)

- **Groq free tier rate-limits** heavy use (HTTP 429), which makes the agent fall
  back to heuristic scoring during bursts. A paid Groq tier removes this.
- **Auto-discovery** is strongest with a `SERPAPI_API_KEY`; without it, discovery
  relies solely on Groq compound (which the free tier rate-limits).
- Resume tailoring / application auto-fill (career-ops style) are **not yet built**.
