import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  Hourglass,
  ShieldCheck,
} from "lucide-react";

import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Coming Soon",
  description:
    "OunceBook is launching soon. Join the waitlist for early access to a more intentional text-first network.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OunceBook | Coming Soon",
    description:
      "Join the OunceBook waitlist for early access to a text-first network built for signal over noise.",
    url: "/",
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
    title: "OunceBook | Coming Soon",
    description:
      "Join the OunceBook waitlist for early access to a text-first network built for signal over noise.",
    images: ["/screenshot-ouncebook.png"],
  },
};

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden font-ui">
      <div className="ambient absolute inset-0 -z-10" aria-hidden="true" />

      <header className="border-b border-divider/90 bg-black/25 backdrop-blur-sm">
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-content-center rounded-md bg-white text-black">
              <Image src="/logo.png" alt="OunceBook logo" width={36} height={36} />
            </div>
            <span className="text-lg font-semibold text-ink">OunceBook</span>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <p className="hidden text-xs tracking-[0.24em] whitespace-nowrap text-secondary sm:block">
              COMING SOON
            </p>

            <a
              className="rounded-lg border border-divider bg-white/3 px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-white/8"
              href="#waitlist"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-16 pb-10 sm:px-6 lg:pt-24">
        <p className="tracking-caps text-xs text-secondary">Early Access</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          OunceBook is launching soon.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-secondary sm:text-lg">
          An ounce of thought in a pound of noise. A text-first network designed
          for intentional expression, not endless distraction.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="chip">Text-only</span>
          <span className="chip">Deliberate publishing</span>
          <span className="chip">Finite attention</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6" id="waitlist">
        <div className="panel grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              Reserve your place in the first wave
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
              Waitlist members will receive launch updates and access invites
              before public rollout.
            </p>
          </div>
          <div className="rounded-xl border border-divider bg-white/3 p-4 sm:p-5">
            <WaitlistForm />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="panel p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Focused by design
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              Every interaction is shaped to reward signal over noise.
            </p>
          </article>

          <article className="panel p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <Hourglass className="h-4 w-4" aria-hidden="true" />
              Rolling invitations
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              Access is released in controlled cohorts to keep quality high.
            </p>
          </article>

          <article className="panel p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Privacy first
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              Waitlist data is minimal, secured, and handled with clear policy.
            </p>
          </article>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-divider px-4 py-7 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} OunceBook. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <Link className="link-soft" href="/privacy">
            Privacy Policy
          </Link>
          <a className="link-soft" href="mailto:hello@ouncebook.com">
            hello@ouncebook.com
          </a>
        </div>
      </footer>
    </main>
  );
}
