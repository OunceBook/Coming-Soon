"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Info,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ApiResponse = {
  success: boolean;
  status?:
    | "verification_sent"
    | "verification_resent"
    | "verification_pending"
    | "already_verified"
    | "rate_limited"
    | "invalid_request"
    | "invalid_email"
    | "invalid_tracking"
    | "disposable_email"
    | "captcha_failed"
    | "server_error";
  message: string;
  canResend?: boolean;
  retryAfterSeconds?: number;
  alreadyRegistered?: boolean;
  verificationRequired?: boolean;
};

type TurnstileWidgetId = string | number;

type TurnstileRenderOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

type StatusModalState = {
  open: boolean;
  title: string;
  lines: string[];
  tone: "success" | "info" | "error";
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement | string,
        options: TurnstileRenderOptions,
      ) => TurnstileWidgetId;
      reset: (widgetId?: TurnstileWidgetId) => void;
    };
  }
}

function formatWaitTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function toStatusModal(data: ApiResponse, responseOk: boolean): StatusModalState {
  const wait = data.retryAfterSeconds
    ? formatWaitTime(data.retryAfterSeconds)
    : null;

  if (responseOk && data.status === "verification_sent") {
    return {
      open: true,
      tone: "success",
      title: "Verification email sent",
      lines: [
        "We sent a verification link to your inbox.",
        "Open the email and click verify to secure your waitlist spot.",
        wait ? `You can request a new verification email in about ${wait}.` : "",
      ].filter(Boolean),
    };
  }

  if (responseOk && data.status === "verification_resent") {
    return {
      open: true,
      tone: "success",
      title: "Verification email resent",
      lines: [
        "A new verification link has been sent.",
        "Use the latest email in your inbox.",
        wait ? `You can request another resend in about ${wait}.` : "",
      ].filter(Boolean),
    };
  }

  if (responseOk && data.status === "verification_pending") {
    return {
      open: true,
      tone: "info",
      title: "Verification already pending",
      lines: [
        "This email is already registered and waiting for verification.",
        "Please check your inbox (or spam folder) for the verification link.",
        wait ? `You can request a resend in about ${wait}.` : "",
      ].filter(Boolean),
    };
  }

  if (responseOk && data.status === "already_verified") {
    return {
      open: true,
      tone: "info",
      title: "Already on the waitlist",
      lines: [
        "This email is already verified and in the queue.",
        "No further action is required.",
      ],
    };
  }

  if (data.status === "rate_limited") {
    return {
      open: true,
      tone: "error",
      title: "Too many attempts",
      lines: [
        wait
          ? `Please wait ${wait} before trying again.`
          : "Please wait before trying again.",
      ],
    };
  }

  if (data.status === "captcha_failed") {
    return {
      open: true,
      tone: "error",
      title: "Captcha verification failed",
      lines: ["Please retry and complete the captcha challenge."],
    };
  }

  if (data.status === "disposable_email") {
    return {
      open: true,
      tone: "error",
      title: "Disposable email not allowed",
      lines: ["Use a permanent email address to join the waitlist."],
    };
  }

  if (data.status === "invalid_email") {
    return {
      open: true,
      tone: "error",
      title: "Invalid email",
      lines: ["Please enter a valid email address and try again."],
    };
  }

  if (data.status === "invalid_tracking") {
    return {
      open: true,
      tone: "error",
      title: "Invalid tracking parameters",
      lines: [
        "Your URL tracking parameters look unsafe or malformed.",
        "Please retry using a clean campaign link.",
      ],
    };
  }

  return {
    open: true,
    tone: responseOk ? "info" : "error",
    title: responseOk ? "Waitlist update" : "Something went wrong",
    lines: [data.message || "Please try again in a moment."],
  };
}

export function WaitlistForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const captchaWidgetIdRef = useRef<TurnstileWidgetId | null>(null);

  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [captchaScriptLoaded, setCaptchaScriptLoaded] = useState(false);
  const [statusModal, setStatusModal] = useState<StatusModalState>({
    open: false,
    title: "",
    lines: [],
    tone: "info",
  });

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const closeCaptchaModal = useCallback(() => {
    setCaptchaModalOpen(false);

    if (captchaWidgetIdRef.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(captchaWidgetIdRef.current);
      } catch {
        // noop
      }
    }

    captchaWidgetIdRef.current = null;

    if (captchaContainerRef.current) {
      captchaContainerRef.current.innerHTML = "";
    }
  }, []);

  const submitWaitlist = useCallback(
    async (captchaToken?: string) => {
      setSubmitting(true);

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
          }),
        });

        const data = (await response.json()) as ApiResponse;
        setStatusModal(toStatusModal(data, response.ok));

        if (response.ok && data.success) {
          setEmail("");
          setHoneypot("");
        }
      } catch {
        setStatusModal({
          open: true,
          tone: "error",
          title: "Network issue",
          lines: ["We could not reach the server. Please try again in a moment."],
        });
      } finally {
        setSubmitting(false);
      }
    },
    [email, honeypot],
  );

  useEffect(() => {
    if (!captchaModalOpen || !turnstileSiteKey || !captchaScriptLoaded) {
      return;
    }

    const turnstile = window.turnstile;
    const container = captchaContainerRef.current;

    if (!turnstile || !container) {
      return;
    }

    container.innerHTML = "";
    captchaWidgetIdRef.current = null;

    captchaWidgetIdRef.current = turnstile.render(container, {
      sitekey: turnstileSiteKey,
      theme: "dark",
      size: "flexible",
      callback: (token: string) => {
        closeCaptchaModal();
        void submitWaitlist(token);
      },
      "error-callback": () => {
        closeCaptchaModal();
        setStatusModal({
          open: true,
          tone: "error",
          title: "Captcha failed",
          lines: ["Please retry the captcha challenge."],
        });
      },
      "expired-callback": () => {
        setStatusModal({
          open: true,
          tone: "error",
          title: "Captcha expired",
          lines: ["The captcha expired before submission. Please try again."],
        });
      },
    });
  }, [
    captchaModalOpen,
    captchaScriptLoaded,
    closeCaptchaModal,
    submitWaitlist,
    turnstileSiteKey,
  ]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isValid = formRef.current?.reportValidity() ?? false;

    if (!isValid) {
      return;
    }

    if (turnstileSiteKey) {
      if (!captchaScriptLoaded) {
        setStatusModal({
          open: true,
          tone: "info",
          title: "Captcha loading",
          lines: ["Captcha is still loading. Please click again in a second."],
        });
        return;
      }

      setCaptchaModalOpen(true);
      return;
    }

    await submitWaitlist(undefined);
  }

  return (
    <>
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
          onLoad={() => setCaptchaScriptLoaded(true)}
        />
      ) : null}

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
      </form>

      {captchaModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="captcha-modal-title"
        >
          <div className="panel w-full max-w-md p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-content-center rounded-full border border-divider bg-white/4">
                  <ShieldCheck className="h-5 w-5 text-ink" aria-hidden="true" />
                </span>
                <div>
                  <h3 id="captcha-modal-title" className="text-lg font-semibold text-ink">
                    Human Check
                  </h3>
                  <p className="text-xs text-secondary">Security step before submission</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeCaptchaModal}
                aria-label="Close captcha modal"
                className="h-8 w-8 rounded-md p-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="mt-4 rounded-lg border border-divider bg-white/3 p-3">
              <p className="mb-3 text-sm text-secondary">
                Complete the captcha to submit your waitlist request.
              </p>
              <div ref={captchaContainerRef} />
            </div>

            <div className="mt-4 rounded-lg border border-divider bg-white/2 px-3 py-2 text-xs text-secondary">
              This modal closes automatically after successful verification.
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={closeCaptchaModal}>
                Cancel Verification
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {statusModal.open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-modal-title"
        >
          <div className="panel w-full max-w-lg p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-10 w-10 place-content-center rounded-full border border-divider bg-white/4">
                  {statusModal.tone === "success" ? (
                    <ShieldCheck className="h-5 w-5 text-ink" aria-hidden="true" />
                  ) : statusModal.tone === "error" ? (
                    <AlertCircle className="h-5 w-5 text-ink" aria-hidden="true" />
                  ) : (
                    <Info className="h-5 w-5 text-ink" aria-hidden="true" />
                  )}
                </span>

                <div>
                  <p className="text-xs tracking-[0.16em] text-secondary uppercase">
                    Waitlist Update
                  </p>
                  <h3 id="status-modal-title" className="mt-1 text-lg font-semibold text-ink">
                    {statusModal.title}
                  </h3>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setStatusModal((previous) => ({
                    ...previous,
                    open: false,
                  }))
                }
                aria-label="Close status modal"
                className="h-8 w-8 rounded-md p-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="mt-4 rounded-lg border border-divider bg-white/2 p-4">
              <ul className="space-y-2 text-sm leading-relaxed text-secondary">
                {statusModal.lines.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/80" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-divider bg-white/2 px-3 py-2 text-xs text-secondary">
              <span>Need help?</span>
              <a className="link-soft" href="mailto:hello@ouncebook.com">
                hello@ouncebook.com
              </a>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setStatusModal((previous) => ({
                    ...previous,
                    open: false,
                  }))
                }
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
