import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Hourglass, Users } from "lucide-react";

import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Coming Soon",
  description:
    "A social network with no feed. An AI reads what your friends wrote and catches you up on the few things worth knowing. Join the waitlist.",
  alternates: {
    canonical: "/",
  },
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
          A social network with no feed.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-secondary sm:text-lg">
          An ounce of thought in a pound of noise. An AI reads what your friends
          wrote and catches you up on the few things worth knowing — the way a
          friend would. No scrolling. No ranking. No infinite anything.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="chip">No feed, ever</span>
          <span className="chip">The AI reads for you</span>
          <span className="chip">Finite attention</span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-divider px-5 py-4 sm:px-7">
            <p className="tracking-caps text-xs text-secondary">
              Tuesday · your catch-up
            </p>
            <p className="text-xs text-secondary tabular-nums">
              7 attends left · 250 words
            </p>
          </div>

          <div className="voice space-y-4 px-5 py-7 text-lg leading-relaxed text-ink sm:px-7 sm:text-xl">
            <p>Morning. Three things.</p>
            <p>
              Rafi left the agency on Friday — no next thing lined up. He sounded
              more relieved than worried, though he mentioned rent twice.
            </p>
            <p>
              Maya&rsquo;s back from Istanbul. She posted a photo of a bookshop
              she wants to take you to.
            </p>
            <p>
              Nadia asked, fairly quietly, whether anyone&rsquo;s around on
              Sunday. Two people have said yes so far.
            </p>
            <p className="text-secondary italic">
              That&rsquo;s everything. Nothing else needs your morning.
            </p>
          </div>

          <div
            className="flex flex-wrap gap-2 border-t border-divider px-5 py-4 sm:px-7"
            aria-hidden="true"
          >
            <span className="affordance">Open Rafi&rsquo;s post</span>
            <span className="affordance">Tell Nadia I&rsquo;m in</span>
            <span className="affordance">Write something</span>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-secondary">
          A preview of your daily catch-up. Every sentence traces back to a real
          post — tap any of it to read the original.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6" id="waitlist">
        <div className="panel grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
              Reserve your place in the first wave
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
              We open in small groups of people who already know each other — a
              network like this only works if it&rsquo;s dense. Tell us who
              you&rsquo;d bring and we&rsquo;ll bring you in together.
            </p>
          </div>
          <div className="rounded-xl border border-divider bg-white/3 p-4 sm:p-5">
            <WaitlistForm />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="panel p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              The AI does the reading
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              Open OunceBook and it tells you what happened while you were gone.
              Who posted, what it meant, what needs you. There is nothing to
              scroll.
            </p>
          </article>

          <article className="panel p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <Hourglass className="h-4 w-4" aria-hidden="true" />
              Attention that means something
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              A daily budget of words to write, and a limited number of posts you
              can go deep on. When attention is scarce, six people spending
              theirs on you actually means something.
            </p>
          </article>

          <article className="panel p-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
              <Users className="h-4 w-4" aria-hidden="true" />
              People you actually know
            </p>
            <p className="text-sm leading-relaxed text-secondary">
              Connections are mutual and capped. No suggestions, no followers, no
              strangers, no numbers to perform for.
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
