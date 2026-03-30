import nodemailer from "nodemailer";

type MailContext = {
  transport: nodemailer.Transporter;
  from: string;
  replyTo?: string;
};

declare global {
  var _smtpContext: MailContext | undefined;
}

function getSmtpContext() {
  if (global._smtpContext) {
    return global._smtpContext;
  }

  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const from = process.env.SMTP_FROM;

  if (!host || !portRaw || !from) {
    throw new Error("Missing SMTP config. Set SMTP_HOST, SMTP_PORT, and SMTP_FROM.");
  }

  const port = Number(portRaw);

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT must be a number.");
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined,
    pool: true,
    maxConnections: 2,
    maxMessages: 100,
  });

  global._smtpContext = {
    transport,
    from,
    replyTo: process.env.SMTP_REPLY_TO,
  };

  return global._smtpContext;
}

export async function sendWaitlistVerificationEmail(args: {
  to: string;
  verificationUrl: string;
}) {
  const smtp = getSmtpContext();

  const text = [
    "Verify your OunceBook waitlist request",
    "",
    "Confirm this email to secure your place in line:",
    args.verificationUrl,
    "",
    "If this wasn't you, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Verify your OunceBook waitlist request</h2>
      <p style="margin: 0 0 12px;">Confirm this email to secure your place in line.</p>
      <p style="margin: 0 0 16px;">
        <a href="${args.verificationUrl}" style="display: inline-block; padding: 10px 14px; background: #111; color: #fff; text-decoration: none; border-radius: 8px;">
          Verify email
        </a>
      </p>
      <p style="margin: 0; font-size: 12px; color: #555;">If this wasn't you, you can ignore this email.</p>
    </div>
  `;

  await smtp.transport.sendMail({
    from: smtp.from,
    to: args.to,
    replyTo: smtp.replyTo,
    subject: "Verify your OunceBook waitlist request",
    text,
    html,
  });
}
