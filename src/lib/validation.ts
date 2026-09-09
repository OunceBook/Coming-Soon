import { z } from "zod";

const UTM_MAX_LENGTH = 120;
const UTM_SAFE_PATTERN = /^[a-z0-9._~:/@%+\-|,\s]+$/i;
const UTM_BLOCKLIST_PATTERN =
  /(javascript:|vbscript:|data:|onerror\s*=|onload\s*=|<|>|%3c|%3e)/i;

function normalizeUtmValue(value: string) {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

const optionalUtmText = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) {
      return undefined;
    }

    const normalized = normalizeUtmValue(value);

    if (!normalized) {
      return undefined;
    }

    if (normalized.length > UTM_MAX_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "UTM value is too long.",
      });
      return z.NEVER;
    }

    // Restrict to printable ASCII and a safe allowlist to reduce header/log/HTML injection vectors.
    if (/[^\x20-\x7E]/.test(normalized) || !UTM_SAFE_PATTERN.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "UTM value contains unsupported characters.",
      });
      return z.NEVER;
    }

    if (UTM_BLOCKLIST_PATTERN.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "UTM value appears unsafe.",
      });
      return z.NEVER;
    }

    return normalized;
  });

const MAX_INVITEES = 5;
const INVITE_INPUT_MAX_LENGTH = 500;

const emailPattern = z.string().email();

/**
 * "Who would you bring?" — accepts addresses separated by commas, newlines,
 * semicolons or spaces. Invalid fragments are dropped rather than failing the
 * whole signup: someone fumbling a friend's address should still get onto the
 * waitlist themselves.
 */
export function parseInviteeEmails(raw: string, selfEmail?: string) {
  const seen = new Set<string>();
  const valid: string[] = [];
  let rejected = 0;

  for (const fragment of raw.split(/[\s,;]+/)) {
    const candidate = fragment.trim().toLowerCase();

    if (!candidate) {
      continue;
    }

    if (!emailPattern.safeParse(candidate).success) {
      rejected += 1;
      continue;
    }

    // Naming yourself is a no-op, not an error.
    if (selfEmail && candidate === selfEmail.toLowerCase()) {
      continue;
    }

    if (seen.has(candidate)) {
      continue;
    }

    seen.add(candidate);

    if (valid.length < MAX_INVITEES) {
      valid.push(candidate);
    }
  }

  return { emails: valid, rejected, truncated: seen.size > MAX_INVITEES };
}

const optionalInviteeInput = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) {
      return undefined;
    }

    const normalized = value.normalize("NFKC").trim();

    if (!normalized) {
      return undefined;
    }

    if (normalized.length > INVITE_INPUT_MAX_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "That list is too long.",
      });
      return z.NEVER;
    }

    return normalized;
  });

export const waitlistPayloadSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  bringing: optionalInviteeInput,
  utmSource: optionalUtmText,
  utmMedium: optionalUtmText,
  utmCampaign: optionalUtmText,
  utmTerm: optionalUtmText,
  utmContent: optionalUtmText,
  honeypot: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default(""),
  captchaToken: z
    .string()
    .trim()
    .max(4096)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type WaitlistPayload = z.infer<typeof waitlistPayloadSchema>;
