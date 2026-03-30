"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ApiResponse = {
  success: boolean;
  message: string;
  status?: "joined" | "already_joined";
};

type FormState = {
  type: "idle" | "success" | "error";
  message: string;
};

export function WaitlistForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    type: "idle",
    message: "",
  });

  const metadata = useMemo(
    () => ({
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
      referrer: "",
    }),
    [],
  );

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    metadata.utmSource = params.get("utm_source") ?? "";
    metadata.utmMedium = params.get("utm_medium") ?? "";
    metadata.utmCampaign = params.get("utm_campaign") ?? "";
    metadata.utmTerm = params.get("utm_term") ?? "";
    metadata.utmContent = params.get("utm_content") ?? "";
    metadata.referrer = document.referrer;
  }, [metadata]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormState({ type: "idle", message: "" });

    const captchaToken =
      (formRef.current?.querySelector(
        'input[name="cf-turnstile-response"]',
      ) as HTMLInputElement | null)?.value ?? "";

    if (turnstileSiteKey && !captchaToken) {
      setFormState({
        type: "error",
        message: "Complete the captcha before submitting.",
      });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          honeypot,
          captchaToken,
          consentTimestamp: new Date().toISOString(),
          ...metadata,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        setFormState({
          type: "error",
          message: data.message || "Could not save your spot. Please retry.",
        });
        return;
      }

      setFormState({ type: "success", message: data.message });
      setEmail("");
      setHoneypot("");
    } catch {
      setFormState({
        type: "error",
        message: "Network issue. Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} ref={formRef}>
      <label className="block text-sm font-medium text-ink" htmlFor="email">
        Join the waitlist
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-secondary"
          />
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby="waitlist-help"
            className="pl-9"
          />
        </div>

        <Button className="w-full sm:w-auto" disabled={submitting} type="submit">
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          {submitting ? "Submitting..." : "Get Early Access"}
        </Button>
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <p
        id="waitlist-help"
        className="flex items-center gap-2 text-xs leading-relaxed text-secondary"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Verification required. No spam. Product updates only.
      </p>

      {turnstileSiteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-theme="dark"
            data-size="flexible"
          />
        </>
      ) : null}

      <p
        aria-live="polite"
        className={
          formState.type === "idle"
            ? "sr-only"
            : "flex items-start gap-2 rounded-lg border border-divider bg-white/[0.05] px-3 py-2 text-sm text-ink"
        }
      >
        {formState.type === "success" ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span>{formState.message}</span>
      </p>
    </form>
  );
}
