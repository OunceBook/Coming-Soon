"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  return (
    <section className="panel w-full p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
        {state.loading
          ? "Verifying"
          : state.success
            ? "Verification complete"
            : "Verification failed"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
        {state.message}
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="rounded-lg border border-divider bg-white/[0.03] px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white/[0.08]"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
