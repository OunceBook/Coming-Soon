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

export const waitlistPayloadSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
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
