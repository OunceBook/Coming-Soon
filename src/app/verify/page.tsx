import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyWaitlistClient } from "@/components/verify-waitlist-client";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email to complete your OunceBook waitlist signup.",
  alternates: {
    canonical: "/verify",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Verify Email | OunceBook",
    description: "Verify your email to complete your OunceBook waitlist signup.",
    url: "/verify",
    images: [
      {
        url: "/screenshot-ouncebook.png",
        width: 1918,
        height: 942,
        alt: "OunceBook coming soon page preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify Email | OunceBook",
    description: "Verify your email to complete your OunceBook waitlist signup.",
    images: ["/screenshot-ouncebook.png"],
  },
};

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
