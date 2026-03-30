import { createHash, randomBytes } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { verifyTurnstileToken } from "@/lib/captcha";
import { isDisposableEmail } from "@/lib/disposable-email";
import { getWaitlistCollection } from "@/lib/mongodb";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendWaitlistVerificationEmail } from "@/lib/smtp";
import { waitlistPayloadSchema } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? 5);
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const RESEND_COOLDOWN_MS = Number(
  process.env.VERIFICATION_RESEND_COOLDOWN_MS ?? 10 * 60 * 1000,
);

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT ?? "ouncebook-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

function hashVerificationToken(token: string) {
  const salt = process.env.VERIFICATION_TOKEN_SALT ?? process.env.IP_HASH_SALT ?? "ouncebook-token-salt";
  return createHash("sha256").update(`${token}:${salt}`).digest("hex");
}

function createVerificationToken() {
  return randomBytes(32).toString("hex");
}

function buildVerificationUrl(token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ouncebook.com";
  return `${siteUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
}

function secondsUntil(dateMs: number) {
  return Math.max(1, Math.ceil((dateMs - Date.now()) / 1000));
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: "invalid_request",
        message: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const parsed = waitlistPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        status: "invalid_email",
        message: "Please provide a valid email.",
      },
      { status: 400 },
    );
  }

  if (isDisposableEmail(parsed.data.email)) {
    return NextResponse.json(
      {
        success: false,
        status: "disposable_email",
        message: "Disposable email addresses are not supported.",
      },
      { status: 400 },
    );
  }

  const clientIp = getClientIp(request);
  const captcha = await verifyTurnstileToken(parsed.data.captchaToken, clientIp);

  if (!captcha.ok) {
    return NextResponse.json(
      {
        success: false,
        status: "captcha_failed",
        message: "Captcha verification failed. Please try again.",
      },
      { status: 400 },
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({
      success: true,
      status: "verification_sent",
      message: "Check your inbox and verify your email to confirm your spot.",
      verificationRequired: true,
      alreadyRegistered: false,
      canResend: false,
      retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    });
  }

  const ipHash = hashIp(clientIp);
  const rateKey = `waitlist:${ipHash}`;

  if (!checkRateLimit(rateKey, MAX_REQUESTS, WINDOW_MS)) {
    return NextResponse.json(
      {
        success: false,
        status: "rate_limited",
        message: "Too many attempts. Please try again shortly.",
        retryAfterSeconds: Math.ceil(WINDOW_MS / 1000),
      },
      { status: 429 },
    );
  }

  try {
    const collection = await getWaitlistCollection();
    const existing = await collection.findOne({ email: parsed.data.email });

    if (existing?.status === "verified" || existing?.verifiedAt) {
      return NextResponse.json({
        success: true,
        status: "already_verified",
        message: "This email is already verified on the waitlist.",
        verificationRequired: false,
        alreadyRegistered: true,
        canResend: false,
      });
    }

    if (
      existing?.verificationRequestedAt &&
      Date.now() - new Date(existing.verificationRequestedAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      const nextAllowedAt =
        new Date(existing.verificationRequestedAt).getTime() + RESEND_COOLDOWN_MS;

      return NextResponse.json({
        success: true,
        status: "verification_pending",
        message: "Verification email already sent.",
        verificationRequired: true,
        alreadyRegistered: true,
        canResend: false,
        retryAfterSeconds: secondsUntil(nextAllowedAt),
      });
    }

    const now = new Date();
    const verificationToken = createVerificationToken();
    const verificationTokenHash = hashVerificationToken(verificationToken);
    const verificationUrl = buildVerificationUrl(verificationToken);

    const wasExisting = Boolean(existing);

    if (!existing) {
      await collection.insertOne({
        email: parsed.data.email,
        status: "pending",
        source: "coming-soon",
        utm: {
          source: parsed.data.utmSource,
          medium: parsed.data.utmMedium,
          campaign: parsed.data.utmCampaign,
          term: parsed.data.utmTerm,
          content: parsed.data.utmContent,
        },
        referrer: parsed.data.referrer ?? null,
        consentedAt: parsed.data.consentTimestamp,
        ipHash,
        createdAt: now,
        verificationTokenHash,
        verificationRequestedAt: now,
        verificationSentCount: 1,
        verifiedAt: null,
      });
    } else {
      await collection.updateOne(
        { email: parsed.data.email },
        {
          $set: {
            status: "pending",
            verificationTokenHash,
            verificationRequestedAt: now,
            consentedAt: parsed.data.consentTimestamp,
            ipHash,
          },
          $inc: {
            verificationSentCount: 1,
          },
        },
      );
    }

    await sendWaitlistVerificationEmail({
      to: parsed.data.email,
      verificationUrl,
    });

    return NextResponse.json({
      success: true,
      status: wasExisting ? "verification_resent" : "verification_sent",
      message: "Check your inbox and verify your email to confirm your spot.",
      verificationRequired: true,
      alreadyRegistered: wasExisting,
      canResend: false,
      retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    });
  } catch (error) {
    console.error("Waitlist signup failed", error);
    return NextResponse.json(
      {
        success: false,
        status: "server_error",
        message: "Something went wrong. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
