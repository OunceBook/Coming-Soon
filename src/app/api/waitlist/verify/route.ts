import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getWaitlistCollection } from "@/lib/mongodb";

export const runtime = "nodejs";

const verifySchema = z.object({
  token: z.string().trim().min(30).max(300),
});

function hashVerificationToken(token: string) {
  const salt = process.env.VERIFICATION_TOKEN_SALT ?? process.env.IP_HASH_SALT ?? "ouncebook-token-salt";
  return createHash("sha256").update(`${token}:${salt}`).digest("hex");
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = verifySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid verification token." },
      { status: 400 },
    );
  }

  try {
    const collection = await getWaitlistCollection();
    const tokenHash = hashVerificationToken(parsed.data.token);

    const result = await collection.updateOne(
      {
        verificationTokenHash: tokenHash,
        status: "pending",
      },
      {
        $set: {
          status: "verified",
          verifiedAt: new Date(),
          verificationTokenHash: null,
        },
      },
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification link is invalid or expired.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email verified. You are officially on the waitlist.",
    });
  } catch (error) {
    console.error("Waitlist verification failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
