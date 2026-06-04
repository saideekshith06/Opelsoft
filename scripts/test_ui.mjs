// Browser-level UI test: drives the real dashboard with Playwright (clicks
// buttons, fills forms, asserts on visible results).
//
//   (terminal 1) npm run dev
//   (terminal 2) node scripts/test_ui.mjs
//
// Exits non-zero on any failed check. Set HEADED=1 to watch it run.

import { chromium } from 'playwright';

const BASE = process.env.UI_BASE || 'http://localhost:3000';
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, detail: err.message });
    console.log(`✗ ${name} — ${err.message}`);
  }
}

const rnd = () => Math.floor(Math.random() * 1e7);

async function run() {
  const browser = await chromium.launch({ headless: !process.env.HEADED });
  try {
    // ---------------- CANDIDATE ----------------
    const candName = `ui_cand_${rnd()}`;
    const cCtx = await browser.newContext();
    const cp = await cCtx.newPage();

    await check('Candidate registers via UI and lands on dashboard', async () => {
      await cp.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
      // candidate is the default role
      await cp.locator('#register-email').fill(`${candName}@t.com`);
      await cp.locator('#register-username').fill(candName);
      await cp.locator('#register-password').fill('Pass123!');
      await cp.getByRole('button', { name: 'Register' }).click();
      await cp.waitForURL('**/dashboard/candidate', { timeout: 12000 });
    });

    await check('Candidate saves Profile Settings (sees success toast)', async () => {
      await cp.getByRole('button', { name: /Profile Settings/ }).click();
      // first two form-control inputs in this tab are phone + salary
      const phone = cp.locator('input.form-control').first();
      await phone.fill('07123456789');
      await cp.getByRole('button', { name: 'Save Settings' }).click();
      await cp.getByText('Profile updated successfully!').waitFor({ timeout: 10000 });
    });

    await check('Candidate adds a skill in Resume builder', async () => {
      await cp.getByRole('button', { name: /Resume & CV Manager/ }).click();
      const before = await cp.getByPlaceholder('Skill (e.g. Node.js)').count();
      await cp.getByRole('button', { name: '+ Add Skill' }).click();
      const after = await cp.getByPlaceholder('Skill (e.g. Node.js)').count();
      if (after <= before) throw new Error(`skill row not added (${before} -> ${after})`);
    });

    await check('Candidate opens AI Recruiting Agent and adds a crawl source', async () => {
      await cp.getByRole('button', { name: /AI Recruiting Agent/ }).click();
      await cp.getByText('Agent Configurations').waitFor({ timeout: 12000 });
      const url = `boards.greenhouse.io/uitest${rnd()}`;
      await cp.getByPlaceholder('e.g. boards.greenhouse.io/openai').fill(url);
      await cp.getByRole('button', { name: '+ Add' }).click();
      await cp.getByText('Career page source added successfully!').waitFor({ timeout: 10000 });
    });

    await check('Candidate toggles auto-discovery and saves config', async () => {
      await cp.getByRole('button', { name: 'Save Agent Config' }).click();
      await cp.getByText('AI Agent configurations updated successfully!').waitFor({ timeout: 10000 });
    });

    await cCtx.close();

    // ---------------- EMPLOYER ----------------
    const empName = `ui_emp_${rnd()}`;
    const eCtx = await browser.newContext();
    const ep = await eCtx.newPage();

    await check('Employer registers via UI and lands on dashboard', async () => {
      await ep.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
      await ep.getByText('Post Jobs & Recruit').click(); // select Employer role card
      await ep.locator('#register-email').fill(`${empName}@t.com`);
      await ep.locator('#register-username').fill(empName);
      await ep.locator('#register-password').fill('Pass123!');
      await ep.getByRole('button', { name: 'Register' }).click();
      await ep.waitForURL('**/dashboard/employer', { timeout: 12000 });
    });

    const jobTitle = `UI Test Role ${rnd()}`;
    await check('Employer posts a job via the form (sees success)', async () => {
      await ep.getByRole('button', { name: 'Post a Job', exact: true }).click();
      await ep.getByPlaceholder('e.g. Senior Full-Stack Engineer').fill(jobTitle);
      await ep.getByPlaceholder('London').fill('London');
      await ep.getByPlaceholder('United Kingdom').fill('UK');
      await ep.getByRole('button', { name: 'Publish Job Listing' }).click();
      await ep.getByText('Job position posted successfully!').waitFor({ timeout: 10000 });
    });

    await check('Posted job appears in Active Job Listings', async () => {
      // The post handler auto-switches to the jobs tab ~1.5s after success.
      await ep.getByText(jobTitle).first().waitFor({ timeout: 12000 });
    });

    await eCtx.close();

    // ---------------- LOGIN FLOW ----------------
    const lCtx = await browser.newContext();
    const lp = await lCtx.newPage();
    await check('Existing candidate can log in via /login form', async () => {
      await lp.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
      await lp.locator('#username').fill(candName);
      await lp.locator('#password').fill('Pass123!');
      await lp.getByRole('button', { name: 'Log In' }).click();
      await lp.waitForURL('**/dashboard/candidate', { timeout: 25000 });
    });
    await lCtx.close();

  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n==== ${results.length - failed.length}/${results.length} UI checks passed ====`);
  if (failed.length) { failed.forEach((f) => console.log(`  ✗ ${f.name}: ${f.detail}`)); process.exit(1); }
  console.log('ALL UI CHECKS PASSED ✓');
}

run().catch((e) => { console.error('UI test harness error:', e); process.exit(1); });
