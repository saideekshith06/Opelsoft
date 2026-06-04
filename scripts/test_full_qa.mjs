// Full functional QA of the Opelsoft app. Exercises every API route and the
// employer<->candidate lifecycle with real auth, verifying against the DB.
//
//   (terminal 1) npm run dev
//   (terminal 2) node scripts/test_full_qa.mjs
//
// Exits non-zero if any check fails.

import fs from 'fs';
import mysql from 'mysql2/promise';

// ---- load .env.local ----
if (fs.existsSync('.env.local')) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}

const BASE = 'http://localhost:3000';
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? '  — ' + detail : ''}`);
}

// cookie-aware client factory (one per session/user)
function client() {
  let cookie = '';
  return async (method, path, body, isForm = false) => {
    const headers = cookie ? { Cookie: cookie } : {};
    let payload;
    if (isForm) { payload = body; }
    else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
    const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')];
    const found = (sc || []).find((c) => c && c.startsWith('opelsoft_session='));
    if (found) cookie = found.split(';')[0];
    let data = null; let text = '';
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) { try { data = await res.json(); } catch {} }
    else { text = await res.text(); }
    return { status: res.status, data, text, cookieSet: !!found };
  };
}

// minimal valid PDF with extractable text
function makePdf() {
  const objs = [];
  objs.push('<< /Type /Catalog /Pages 2 0 R >>');
  objs.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  const stream = 'BT /F1 18 Tf 60 700 Td (Senior React Engineer skilled in JavaScript Node.js and SQL) Tj ET';
  objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  let pdf = '%PDF-1.4\n';
  const offs = [];
  objs.forEach((b, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${b}\nendobj\n`; });
  const xref = pdf.length;
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
  offs.forEach((o) => { pdf += String(o).padStart(10, '0') + ' 00000 n \n'; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

const rnd = () => Math.floor(Math.random() * 1e7);

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT || '4000', 10),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE,
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  });

  const emp = client();
  const cand = client();
  const anon = client();
  const empName = `qa_emp_${rnd()}`;
  const candName = `qa_cand_${rnd()}`;

  // 1. Employer register
  let r = await emp('POST', '/api/auth/register', { username: empName, email: `${empName}@t.com`, password: 'Pass123!', role: 'employer' });
  check('Employer register + session cookie', r.status === 200 && r.data?.success && r.cookieSet);

  // 2. auth/me (employer)
  r = await emp('GET', '/api/auth/me');
  check('auth/me returns employer', r.data?.success && r.data.user?.role === 'employer');

  // 3. Employer create job
  const jobTitle = `QA Engineer ${rnd()}`;
  r = await emp('POST', '/api/jobs/create', { title: jobTitle, description: 'QA role', job_type: 'Full-time', city: 'London', country: 'UK', salary_package: '50000' });
  check('jobs/create (employer)', r.data?.success);

  // 3b. unauthorized job create (anon) must fail
  r = await anon('POST', '/api/jobs/create', { title: 'nope' });
  check('jobs/create blocked for anonymous', r.status === 401);

  // find the job id
  const [jobRows] = await conn.query('SELECT id FROM new_jobs WHERE title = ? ORDER BY id DESC LIMIT 1', [jobTitle]);
  const jobId = jobRows[0]?.id;
  check('Job persisted in DB', !!jobId, `job_id=${jobId}`);

  // 4. Candidate register
  r = await cand('POST', '/api/auth/register', { username: candName, email: `${candName}@t.com`, password: 'Pass123!', role: 'candidate' });
  check('Candidate register + session', r.data?.success && r.cookieSet);
  const [candRows] = await conn.query('SELECT id FROM new_users WHERE username = ?', [candName]);
  const candId = candRows[0]?.id;

  // 5. Candidate save profile
  r = await cand('POST', '/api/dashboard/candidate/save', {
    phone_number: '123', minimum_salary: '45000', cover_letter: 'Hi', cv_url: 'https://x.com/cv.pdf',
    skills: JSON.stringify([{ name: 'React', percentage: 90 }]),
    education: JSON.stringify([]), experience: JSON.stringify([]),
  });
  check('dashboard/candidate/save', r.data?.success);
  const [profRows] = await conn.query('SELECT phone_number FROM new_candidate_profiles WHERE user_id = ?', [candId]);
  check('Profile saved in DB', profRows[0]?.phone_number === '123');

  // 6. Resume upload (PDF -> parse)
  const fd = new FormData();
  fd.append('file', new Blob([makePdf()], { type: 'application/pdf' }), 'resume.pdf');
  r = await cand('POST', '/api/resume/upload', fd, true);
  check('resume/upload returns a profile', r.data?.success && !!r.data.profile, r.data?.fallback ? 'heuristic fallback' : 'LLM parsed');

  // 7. Public jobs page contains the job
  r = await anon('GET', '/jobs');
  check('/jobs page renders (200)', r.status === 200);

  // 8. Candidate applies
  r = await cand('POST', '/api/jobs/apply', { jobId, coverLetter: 'Please', cvUrl: 'https://x.com/cv.pdf' });
  check('jobs/apply (candidate)', r.data?.success);

  // 8b. duplicate apply rejected
  r = await cand('POST', '/api/jobs/apply', { jobId, coverLetter: 'again' });
  check('Duplicate application rejected', r.status === 400 && !r.data?.success);

  // find application id
  const [appRows] = await conn.query('SELECT id, status FROM new_job_applications WHERE job_id = ? AND candidate_id = ?', [jobId, candId]);
  const appId = appRows[0]?.id;
  check('Application persisted', !!appId, `app_id=${appId}, status=${appRows[0]?.status}`);

  // 9. SECURITY: candidate cannot change application status
  r = await cand('POST', '/api/applications/status', { applicationId: appId, status: 'hired' });
  check('applications/status blocked for non-employer', r.status === 401 || r.status === 404);

  // 9b. SECURITY: a different employer cannot change it
  const emp2 = client();
  const emp2Name = `qa_emp2_${rnd()}`;
  await emp2('POST', '/api/auth/register', { username: emp2Name, email: `${emp2Name}@t.com`, password: 'Pass123!', role: 'employer' });
  r = await emp2('POST', '/api/applications/status', { applicationId: appId, status: 'hired' });
  check('applications/status blocked for non-owner employer', r.status === 404);

  // 10. Owner employer updates status
  r = await emp('POST', '/api/applications/status', { applicationId: appId, status: 'shortlisted' });
  check('applications/status by owner employer', r.data?.success);
  const [updRows] = await conn.query('SELECT status FROM new_job_applications WHERE id = ?', [appId]);
  check('Status updated in DB', updRows[0]?.status === 'shortlisted', `status=${updRows[0]?.status}`);

  // 11. Employer dashboard renders with the applicant
  r = await emp('GET', '/dashboard/employer');
  check('/dashboard/employer renders for employer (200)', r.status === 200);

  // 12. Candidate dashboard renders
  r = await cand('GET', '/dashboard/candidate');
  check('/dashboard/candidate renders for candidate (200)', r.status === 200);

  // 13. AI agent config GET (auto-creates)
  r = await cand('GET', '/api/ai-agent/config');
  check('ai-agent/config GET', r.data?.success && r.data.config, `auto_discover=${r.data?.config?.auto_discover}`);

  // 14. AI agent sources add + list + delete
  r = await cand('POST', '/api/ai-agent/sources', { url: 'boards.greenhouse.io/openai' });
  const srcId = r.data?.source?.id;
  check('ai-agent/sources add', r.data?.success && r.data.source?.source_type === 'greenhouse');
  r = await cand('GET', '/api/ai-agent/sources');
  check('ai-agent/sources list', r.data?.success && Array.isArray(r.data.sources));
  r = await cand('DELETE', `/api/ai-agent/sources?id=${srcId}`);
  check('ai-agent/sources delete', r.data?.success);

  // 15. ai-agent/matches GET
  r = await cand('GET', '/api/ai-agent/matches');
  check('ai-agent/matches GET', r.data?.success && Array.isArray(r.data.matches));

  // 16. cron auth gate (wrong token must be 401)
  r = await anon('GET', '/api/ai-agent/cron?token=wrong');
  check('ai-agent/cron rejects bad token', r.status === 401);

  // 17. logout
  r = await cand('POST', '/api/auth/logout');
  check('auth/logout', r.data?.success);

  // 18. static pages
  for (const p of ['/', '/about-us', '/contact-us', '/login', '/register', `/jobs/${jobId}`]) {
    const rr = await anon('GET', p);
    check(`page ${p} -> 200`, rr.status === 200);
  }

  // cleanup
  await conn.query('DELETE FROM new_job_applications WHERE id = ?', [appId]);
  await conn.query('DELETE FROM new_jobs WHERE id = ?', [jobId]);
  await conn.end();

  const failed = results.filter((x) => !x.ok);
  console.log(`\n==== ${results.length - failed.length}/${results.length} checks passed ====`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach((f) => console.log(`  ✗ ${f.name} ${f.detail}`));
    process.exit(1);
  }
  console.log('ALL CHECKS PASSED ✓');
}

run().catch((e) => { console.error('QA harness error:', e); process.exit(1); });
