"use client";

import { MotionConfig, motion } from "motion/react";
import { useRef } from "react";

import { useRevealed } from "@/components/motion";

const EASE = [0.22, 0.61, 0.32, 1] as const;

/** Deliberately mundane. This is what a feed feels like, not what it says. */
const SHARDS = [
  "10 things nobody tells you about",
  "Thrilled to announce that I've",
  "RT @everyone this is so real",
  "Day 47 of posting until I",
  "You won't believe what happened",
  "Hot take: actually it's fine",
  "Just shipped 🚀 so proud of",
  "Unpopular opinion but honestly",
  "This changed my life and it can",
  "Grateful. Blessed. Humbled to",
  "A thread on why everyone is",
  "Nobody: … Me at 3am:",
  "Breaking: sources say the",
  "I made $14k last month doing",
  "5 books that will rewire your",
  "Reminder that you are enough",
  "The algorithm hates this one",
  "POV: it's Tuesday and you",
];

const LINES = [
  "Morning. Three things.",
  "Rafi left the agency on Friday — no next thing lined up. He sounded more relieved than worried, though he mentioned rent twice.",
  "Maya’s back from Istanbul. She posted a photo of a bookshop she wants to take you to.",
  "Nadia asked, fairly quietly, whether anyone’s around on Sunday. Two people have said yes so far.",
];

function NoiseColumn({
  seed,
  duration,
}: {
  seed: number;
  duration: number;
}) {
  // Doubled so the linear drift loops seamlessly at -50%.
  const items = [...SHARDS.slice(seed), ...SHARDS.slice(0, seed)];

  return (
    <div
      className="shard-column flex flex-col gap-2"
      style={{ animationDuration: `${duration}s` }}
    >
      {[...items, ...items].map((text, index) => (
        <span className="shard" key={index}>
          {text}
        </span>
      ))}
    </div>
  );
}

/**
 * The page's one big moment, and the only place it argues by demonstration
 * rather than description: a wall of feed noise streams past, then collapses
 * into a single calm catch-up.
 *
 * Triggered on view and played on a timeline rather than scrubbed by scroll —
 * scroll-scrubbing costs the reader a screen of height, janks on mobile, and
 * would put the payoff behind a gesture instead of giving it to them.
 */
export function CatchUpMoment() {
  const ref = useRef<HTMLDivElement>(null);

  // The section has to be properly on screen before the noise gives way, or
  // the payoff plays while the reader is still up in the hero. It must not be
  // so strict that a fast scroll can pass straight through the trigger band
  // and strand the noise — 15% is met on the way in and cannot be met at rest,
  // since the hero keeps this section below the fold. The fallback is a safety
  // net for an observer that never reports, not a timer driving the effect.
  const inView = useRevealed(ref, false, {
    margin: "-15% 0px -15% 0px",
    fallbackMs: 6000,
  });

  const settle = 1.5; // when the noise gives way

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className="relative">
        {/* Noise layer */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          initial={{ opacity: 0.85, filter: "blur(1px)" }}
          animate={
            inView
              ? { opacity: 0, filter: "blur(16px)" }
              : undefined
          }
          transition={{ duration: 1.1, delay: settle, ease: EASE }}
        >
          <div className="grid h-full grid-cols-2 gap-2 p-2 sm:grid-cols-3 lg:grid-cols-4">
            <NoiseColumn seed={0} duration={17} />
            <NoiseColumn seed={5} duration={13} />
            <div className="hidden sm:block">
              <NoiseColumn seed={9} duration={21} />
            </div>
            <div className="hidden lg:block">
              <NoiseColumn seed={13} duration={15} />
            </div>
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--paper) 0%, transparent 22%, transparent 78%, var(--paper) 100%)",
            }}
          />
        </motion.div>

        {/* The ounce */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.975, y: 8 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: settle + 0.35, ease: EASE }}
        >
          <div className="panel overflow-hidden bg-paper-raise/80 backdrop-blur-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-divider px-5 py-4 sm:px-7">
              <p className="eyebrow">Tuesday · your catch-up</p>
              <p className="text-xs text-secondary tabular-nums">
                7 attends left · 250 words
              </p>
            </div>

            <div className="voice space-y-4 px-5 py-7 text-lg leading-relaxed text-ink sm:px-7 sm:text-xl">
              {LINES.map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: 0.5,
                    delay: settle + 0.7 + index * 0.16,
                    ease: EASE,
                  }}
                >
                  {line}
                </motion.p>
              ))}
              <motion.p
                className="text-secondary italic"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.6, delay: settle + 1.4, ease: EASE }}
              >
                That&rsquo;s everything. Nothing else needs your morning.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-2 border-t border-divider px-5 py-4 sm:px-7"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: settle + 1.7, ease: EASE }}
            >
              <span className="affordance">Open Rafi&rsquo;s post</span>
              <span className="affordance">Tell Nadia I&rsquo;m in</span>
              <span className="affordance">Write something</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
