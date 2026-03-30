import { Suspense } from "react";

import { VerifyWaitlistClient } from "@/components/verify-waitlist-client";

function VerifyFallback() {
  return (
    <section className="panel w-full p-6 sm:p-8">
      <p className="text-xs tracking-[0.16em] text-secondary uppercase">Waitlist Verification</p>
      <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">Verifying Your Email</h1>
      <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">Checking your verification link...</p>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <Suspense fallback={<VerifyFallback />}>
        <VerifyWaitlistClient />
      </Suspense>
    </main>
  );
}
