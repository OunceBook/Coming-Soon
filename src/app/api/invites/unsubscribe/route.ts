import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSuppressionCollection } from "@/lib/mongodb";
import { verifyUnsubscribeToken } from "@/lib/invites";

export const runtime = "nodejs";

const querySchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  token: z.string().trim().min(16).max(200),
});

function page(message: string) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<meta name="robots" content="noindex"><title>OunceBook</title></head>` +
      `<body style="margin:0;background:#000;color:#fff;font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">` +
      `<main style="max-width:34rem;margin:0 auto;padding:15vh 24px 0">` +
      `<p style="font-size:13px;letter-spacing:.15em;text-transform:uppercase;opacity:.6;margin:0 0 12px">OunceBook</p>` +
      `<p style="font-size:19px;margin:0">${message}</p>` +
      `</main></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function suppress(email: string, token: string) {
  if (!verifyUnsubscribeToken(email, token)) {
    return page("That link is not valid.");
  }

  try {
    const suppressions = await getSuppressionCollection();

    await suppressions.updateOne(
      { email },
      {
        $setOnInsert: {
          email,
          createdAt: new Date(),
          reason: "unsubscribed" as const,
        },
      },
      { upsert: true },
    );

    return page("Done. We will not contact this address again.");
  } catch (error) {
    console.error("Unsubscribe failed", error);
    return page("Something went wrong. Email hello@ouncebook.com and we will remove you by hand.");
  }
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return page("That link is not valid.");
  }

  return suppress(parsed.data.email, parsed.data.token);
}

/** Mail clients honouring List-Unsubscribe-Post send a POST, not a GET. */
export async function POST(request: NextRequest) {
  return GET(request);
}
