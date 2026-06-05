import pool from '@/lib/db';
import { sendMail, isMailConfigured } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WORK_AUTH = ['OPT', 'CPT', 'H1B', 'Need H1B', 'Green Card', 'US Citizen'];
const RECIPIENT = process.env.INTAKE_TO || 'deekshith@gmail.com';

const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: 'Invalid request.' }, { status: 400 });
  }

  const name = (body.name || '').toString().trim();
  const contact = (body.contact || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const workAuth = (body.workAuth || '').toString().trim();

  if (!name || !contact || !email || !workAuth) {
    return Response.json({ success: false, message: 'All fields are required.' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!WORK_AUTH.includes(workAuth)) {
    return Response.json({ success: false, message: 'Please select a valid work authorization.' }, { status: 400 });
  }

  // Keep a record so nothing is lost even if email delivery is unavailable.
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS new_candidate_intake (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      work_auth VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(
      'INSERT INTO new_candidate_intake (name, contact, email, work_auth) VALUES (?, ?, ?, ?)',
      [name, contact, email, workAuth],
    );
  } catch (e) {
    console.error('Intake DB store failed:', e.message);
  }

  if (!isMailConfigured()) {
    console.warn('Candidate intake received but email is not configured (SMTP_* env vars missing).');
    return Response.json({ success: true, mailed: false });
  }

  try {
    // 1) Notify the team
    await sendMail({
      to: RECIPIENT,
      replyTo: email,
      subject: `New candidate enquiry — ${name}`,
      text: `A candidate submitted the Find Jobs form on OpelSoft.\n\nName: ${name}\nContact: ${contact}\nEmail: ${email}\nWork authorization: ${workAuth}\n`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a">
        <h2 style="margin:0 0 12px">New candidate enquiry</h2>
        <p style="margin:0 0 16px;color:#475569">Submitted via the OpelSoft Find Jobs form.</p>
        <table style="border-collapse:collapse">
          <tr><td style="padding:6px 16px 6px 0;color:#64748b">Name</td><td style="padding:6px 0;font-weight:600">${esc(name)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b">Contact</td><td style="padding:6px 0;font-weight:600">${esc(contact)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b">Email</td><td style="padding:6px 0;font-weight:600">${esc(email)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b">Work authorization</td><td style="padding:6px 0;font-weight:600">${esc(workAuth)}</td></tr>
        </table>
      </div>`,
    });

    // 2) Auto-reply to the candidate
    await sendMail({
      to: email,
      subject: 'We received your details — OpelSoft',
      text: `Hi ${name},\n\nThank you for reaching out to OpelSoft. Our executives will review your details and one of our team members will contact you within 1 working day.\n\nWarm regards,\nThe OpelSoft Team`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a;line-height:1.6">
        <p>Hi ${esc(name)},</p>
        <p>Thank you for reaching out to <strong>OpelSoft</strong>. Our executives will review your details and one of our team members will <strong>contact you within 1 working day</strong>.</p>
        <p style="color:#475569">Warm regards,<br/>The OpelSoft Team</p>
      </div>`,
    });
  } catch (e) {
    console.error('Intake email failed:', e.message);
    return Response.json({ success: true, mailed: false, message: 'Saved, but email delivery failed.' });
  }

  return Response.json({ success: true, mailed: true });
}
