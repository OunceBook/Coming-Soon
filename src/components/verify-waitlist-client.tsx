"use client";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type VerifyState = {
  loading: boolean;
  success: boolean;
  message: string;
};

export function VerifyWaitlistClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>({
    loading: Boolean(token),
    success: false,
    message: token ? "Verifying your email..." : "Verification token missing.",
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    const verify = async () => {
      try {
        const response = await fetch("/api/waitlist/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        });

        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
        };

        setState({
          loading: false,
          success: Boolean(response.ok && data.success),
          message:
            data.message ||
            (response.ok
              ? "Email verified successfully."
              : "Verification failed."),
        });
      } catch {
        setState({
          loading: false,
          success: false,
          message: "Could not verify your email right now.",
        });
      }
    };

    void verify();

    return () => {
      controller.abort();
    };
  }, [token]);

  const title = state.loading
    ? "Verifying Your Email"
    : state.success
      ? "Verification Complete"
      : "Verification Failed";

  const helperLine = state.loading
    ? "This usually takes a few seconds."
    : state.success
      ? "Your address is now confirmed for launch updates."
      : "Your link may be expired, invalid, or already used.";

  return (
    <section className="panel w-full p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-10 w-10 place-content-center rounded-full border border-divider bg-white/[0.04]">
          {state.loading ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-ink" aria-hidden="true" />
          ) : state.success ? (
            <CheckCircle2 className="h-5 w-5 text-ink" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-5 w-5 text-ink" aria-hidden="true" />
          )}
        </span>

        <div>
          <p className="text-xs tracking-[0.16em] text-secondary uppercase">Waitlist Verification</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-divider bg-white/[0.02] p-4">
        <ul className="space-y-2 text-sm leading-relaxed text-secondary sm:text-base">
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/80" aria-hidden="true" />
            <span>{helperLine}</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/80" aria-hidden="true" />
            <span>{state.message}</span>
          </li>
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-divider bg-white/[0.02] px-3 py-2 text-xs text-secondary">
        <span>Need help?</span>
        <a className="link-soft" href="mailto:hello@ouncebook.com">
          hello@ouncebook.com
        </a>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/" className="inline-flex">
          <Button type="button" variant="outline" size="sm">
            Back to Home
          </Button>
        </Link>

        {!state.loading && !state.success ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.reload();
            }}
          >
            Retry Verification
          </Button>
        ) : null}
      </div>
    </section>
  );
}
