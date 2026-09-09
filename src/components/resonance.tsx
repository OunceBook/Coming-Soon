"use client";

import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

import { useRevealed } from "@/components/motion";

function Figure({
  to,
  label,
  accent = false,
  delay = 0,
}: {
  to: number;
  label: string;
  accent?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRevealed(ref);

  // A motion value rather than React state: the count re-renders nothing.
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!inView) {
      return;
    }

    // Respect the OS setting: land on the number instead of counting to it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      count.set(to);
      return;
    }

    const controls = animate(count, to, {
      duration: 1.1,
      delay,
      ease: [0.22, 0.61, 0.32, 1],
    });

    return () => controls.stop();
  }, [inView, to, delay, count]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <motion.span
        className={`stat-figure text-4xl sm:text-5xl ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {rounded}
      </motion.span>
      <span className="text-xs tracking-caps text-faint">{label}</span>
    </div>
  );
}

/**
 * The author-side report. The point of the section is that the middle number
 * is the only one that means anything, so it is the only one that gets the
 * lamplight.
 */
export function ResonanceReport() {
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const quoteShown = useRevealed(quoteRef);

  return (
    <MotionConfig reducedMotion="user">
      <div className="panel bg-paper-soft/60 p-6 sm:p-8">
        <p className="eyebrow">How your post landed</p>

        <div className="mt-6 flex flex-wrap gap-10 sm:gap-14">
          <Figure to={34} label="were told" />
          <Figure to={6} label="chose to go deep" accent delay={0.25} />
          <Figure to={4} label="wrote back" delay={0.5} />
        </div>

        <div className="rule my-6" />

        <motion.p
          ref={quoteRef}
          className="voice max-w-2xl text-lg leading-relaxed text-ink sm:text-xl"
          initial={{ opacity: 0, y: 6 }}
          animate={quoteShown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          &ldquo;Mostly relief on your behalf. Two people were worried about the
          money side, and Nadia said she&rsquo;d been through the same thing in
          2019.&rdquo;
        </motion.p>
      </div>
    </MotionConfig>
  );
}
