import {defineString} from "firebase-functions/params";
import * as nodemailer from "nodemailer";

export const smtpEmail = defineString("SMTP_EMAIL", {default: ""});
export const smtpPassword = defineString("SMTP_PASSWORD", {default: ""});
export const appUrl = defineString("APP_URL", {default: "https://teensworks.com"});

export function getTransport(): nodemailer.Transporter | null {
  const email = smtpEmail.value();
  const password = smtpPassword.value();
  if (!email || !password) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {user: email, pass: password},
  });
}

/** Sends an email. Returns false (and logs) when SMTP is not configured or sending fails. */
export async function sendMail(opts: {to: string; subject: string; html: string}): Promise<boolean> {
  const transporter = getTransport();
  if (!transporter) {
    console.log("SMTP not configured. Skipping email to " + opts.to + ". Set SMTP_EMAIL and SMTP_PASSWORD to enable.");
    return false;
  }
  try {
    await transporter.sendMail({from: `TeenWork <${smtpEmail.value()}>`, ...opts});
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

const esc = (s: string) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RTL purple email wrapper used by every TeenWork email. */
export function emailShell(title: string, subtitle: string, bodyHtml: string): string {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #7C3AED; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0;">${esc(title)}</h1>
        <p style="margin: 5px 0 0;">${esc(subtitle)}</p>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        ${bodyHtml}
      </div>
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 20px;">
        הודעה זו נשלחה אוטומטית ממערכת TeenWork.
      </p>
    </div>`;
}

export {esc as escapeHtml};
