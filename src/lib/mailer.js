// Thin nodemailer wrapper. Configured entirely via env so no secrets live in
// the repo. Returns null transport when unconfigured so callers can degrade
// gracefully instead of throwing.
import nodemailer from 'nodemailer';

let cached;

export function getTransport() {
  if (cached !== undefined) return cached;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    cached = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT) || 465;
  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cached;
}

export function isMailConfigured() {
  return !!getTransport();
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  const transport = getTransport();
  if (!transport) throw new Error('Email is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS).');
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  return transport.sendMail({ from, to, subject, text, html, replyTo });
}
