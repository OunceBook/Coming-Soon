import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { CatchUpMoment } from "@/components/catch-up-moment";
import { Removals } from "@/components/removals";
import { ResonanceReport } from "@/components/resonance";
import { Reveal, Stagger } from "@/components/motion";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Coming Soon",
  description:
    "A social network with no feed. An AI reads what your friends wrote and catches you up on the few things worth knowing. Join the waitlist.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "OunceBook | A social network with no feed",
    description:
      "An AI reads what your friends wrote and catches you up — the way a friend would. No scrolling, no ranking.",
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
    title: "OunceBook | A social network with no feed",
    description:
      "An AI reads what your friends wrote and catches you up — the way a friend would. No scrolling, no ranking.",
    images: ["/screenshot-ouncebook.png"],
  },
};

const STEPS = [
  {
    title: "Your friends write, sparingly",
    body: "Everyone gets a small daily budget of words. When speaking costs something, people say the thing they actually meant.",
  },
  {
    title: "The AI reads all of it",
    body: "It knows who matters to you and what counts as news. It never invents anything — every sentence traces back to a post you are allowed to see.",
  },
  {
    title: "You get told, not shown",
    body: "One catch-up a day. A few things worth knowing, in a voice that sounds like a friend. Then you close it and get on with your morning.",
  },
];

export default function Home() {
  return (
    <main className="relative flex-1 font-ui">
      <div className="ambient fixed inset-0 -z-10" aria-hidden="true" />

      <header className="sticky top-0 z-40 border-b border-divider/80 bg-paper/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-6 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-content-center rounded-md bg-ink">
              <Image src="/logo.png" alt="OunceBook logo" width={32} height={32} />
            </div>
            <span className="font-display text-lg text-ink">OunceBook</span>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-6">
            <p className="hidden text-[0.65rem] tracking-caps whitespace-nowrap text-faint sm:block">
              Coming soon
            </p>
            <a
              className="rounded-full border border-accent/40 bg-accent-dim px-4 py-2 text-xs font-semibold text-accent-strong transition-colors hover:bg-accent/20"
              href="#waitlist"
            >
              Join waitlist
            </a>
          </div>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section className="mx-auto w-full max-w-5xl px-5 pt-20 pb-28 sm:px-8 lg:pt-32 lg:pb-40">
        <Reveal onLoad distance={6}>
          <p className="eyebrow">An ounce of thought in a pound of noise</p>
        </Reveal>
        <Reveal onLoad delay={0.1}>
          <h1 className="font-display mt-6 max-w-3xl text-[2.7rem] leading-[1.04] text-balance text-ink sm:text-[4.6rem]">
            A social network with no feed.
          </h1>
        </Reveal>
        <Reveal onLoad delay={0.22}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-secondary">
            An AI reads what your friends wrote and catches you up on the few
            things worth knowing — the way a friend would. Nothing to scroll,
            nothing ranked, nothing endless.
          </p>
        </Reveal>
        <Reveal onLoad delay={0.34}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
              href="#waitlist"
            >
              Get early access
            </a>
            <span className="text-xs text-faint">
              Invite-only. Opening in small groups.
            </span>
          </div>
        </Reveal>
      </section>

      {/* ---------------- the moment ---------------- */}
      <section className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="font-display text-2xl text-secondary line-through decoration-cold/70">
              A pound of noise
            </p>
            <span className="text-faint">becomes</span>
            <p className="font-display text-2xl text-accent-strong">
              an ounce of thought
            </p>
          </div>
        </Reveal>

        <CatchUpMoment />

        <Reveal delay={0.1}>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-faint">
            A real catch-up, the way it arrives. Every sentence traces back to
            something a friend actually wrote — tap any of it to read the
            original.
          </p>
        </Reveal>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <Reveal>
          <h2 className="font-display max-w-2xl text-3xl leading-tight text-balance text-ink sm:text-5xl">
            You are not the one doing the reading.
          </h2>
        </Reveal>

        <Stagger
          className="mt-12 grid gap-10 sm:grid-cols-3"
          gap={0.12}
        >
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span className="step-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="rule" />
              <h3 className="mt-1 text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-secondary">
                {step.body}
              </p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* ---------------- the attention economy ---------------- */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow">The part nobody else does</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display mt-5 text-3xl leading-tight text-balance text-ink sm:text-4xl">
                A like costs nothing, so it means nothing.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-secondary">
                Here, reading is limited too. You get a handful of moments a day
                to go deep on someone. So when six people spend one of theirs on
                what you wrote, that is a real number — and for the first time,
                you find out how it actually landed.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} distance={14}>
            <ResonanceReport />
          </Reveal>
        </div>
      </section>

      {/* ---------------- removals ---------------- */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
        <Reveal>
          <p className="eyebrow">What we took out</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-display mt-5 mb-12 max-w-2xl text-3xl leading-tight text-balance text-ink sm:text-4xl">
            Most products list what they added.
          </h2>
        </Reveal>
        <Removals />
      </section>

      {/* ---------------- waitlist ---------------- */}
      <section
        className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 py-20 sm:px-8"
        id="waitlist"
      >
        <Reveal distance={14}>
          <div className="panel grid gap-10 bg-paper-soft/60 p-6 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow">Early access</p>
              <h2 className="font-display mt-5 text-3xl leading-tight text-balance text-ink sm:text-4xl">
                Reserve your place in the first wave
              </h2>
              <p className="mt-5 text-base leading-relaxed text-secondary">
                We open in small groups of people who already know each other —
                a network like this only works if it&rsquo;s dense. Name the
                people you&rsquo;d bring and we&rsquo;ll let them know, so you
                arrive together rather than alone.
              </p>
            </div>
            <div className="rounded-xl border border-divider bg-paper/50 p-5 sm:p-6">
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto flex w-full max-w-5xl flex-col gap-4 border-t border-divider px-5 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} OunceBook</p>
        <div className="flex items-center gap-6">
          <Link className="link-soft" href="/privacy">
            Privacy
          </Link>
          <a className="link-soft" href="mailto:hello@ouncebook.com">
            hello@ouncebook.com
          </a>
        </div>
      </footer>
    </main>
  );
}
