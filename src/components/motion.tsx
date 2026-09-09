"use client";

import { MotionConfig, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type RefObject, type ReactNode } from "react";

const EASE = [0.22, 0.61, 0.32, 1] as const;

/**
 * In view, or given up waiting.
 *
 * Content must never depend on an observer firing. A reader who lands on an
 * anchor, jumps the scrollbar, or restores a scroll position can skip past the
 * trigger entirely and be left looking at nothing. The timeout guarantees
 * everything resolves whether or not the observer ever reports.
 */
export function useRevealed(
  ref: RefObject<Element | null>,
  immediate = false,
  {
    margin = "-8% 0px -12% 0px",
    fallbackMs = 2000,
  }: { margin?: string; fallbackMs?: number } = {},
) {
  const inView = useInView(ref, {
    once: true,
    margin: margin as `${number}px`,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (immediate) {
      return;
    }

    const id = window.setTimeout(() => setTimedOut(true), fallbackMs);
    return () => window.clearTimeout(id);
  }, [immediate, fallbackMs]);

  return immediate || inView || timedOut;
}

/**
 * Motion runs with reducedMotion="user" everywhere in this file: anyone who
 * asked their OS for less movement still gets the opacity, just not the
 * transforms, so nothing is left hidden. A <noscript> rule in the layout
 * covers the case where the script never runs at all.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 10,
  className,
  onLoad = false,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
  /** Above the fold: animate on mount instead of waiting for a scroll. */
  onLoad?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const show = useRevealed(ref, onLoad);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={ref}
        className={className}
        initial={{ opacity: 0, y: distance }}
        animate={show ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/** Children arrive one after another. Used where sequence carries meaning. */
export function Stagger({
  children,
  startDelay = 0,
  gap = 0.09,
  distance = 10,
  className,
  onLoad = false,
}: {
  children: ReactNode[];
  startDelay?: number;
  gap?: number;
  distance?: number;
  className?: string;
  onLoad?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const show = useRevealed(ref, onLoad);

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className={className}>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: distance }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.55,
              delay: startDelay + index * gap,
              ease: EASE,
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </MotionConfig>
  );
}
