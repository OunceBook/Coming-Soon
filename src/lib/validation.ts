import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => (value ? value : undefined));

export const waitlistPayloadSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  utmSource: optionalText,
  utmMedium: optionalText,
  utmCampaign: optionalText,
  utmTerm: optionalText,
  utmContent: optionalText,
  referrer: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((value) => (value ? value : undefined)),
  consentTimestamp: z.coerce.date(),
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
