"use client";

import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 0.61, 0.32, 1] as const;

/**
 * One page-load sequence, not scattered effects.
 *
 * `reducedMotion="user"` makes Motion drop transforms for anyone who asked the
 * OS for less movement — the opacity still resolves, so nothing stays hidden.
 * A <noscript> rule in the layout covers the case where the script never runs.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  distance = 10,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: distance }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/**
 * The narrator's lines, arriving one after another the way someone telling you
 * something arrives at it. This is the only place the timing is doing real
 * work, so it gets the longest sequence on the page.
 */
export function RevealLines({
  lines,
  startDelay = 0,
  stagger = 0.14,
  className,
  lineClassName,
}: {
  lines: ReactNode[];
  startDelay?: number;
  stagger?: number;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className={className}>
        {lines.map((line, index) => (
          <motion.p
            key={index}
            className={lineClassName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: startDelay + index * stagger,
              ease: EASE,
            }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </MotionConfig>
  );
}
