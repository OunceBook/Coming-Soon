"use client";

import { MotionConfig, motion } from "motion/react";
import { useRef } from "react";

import { useRevealed } from "@/components/motion";

const REMOVED = [
  "The feed",
  "Likes",
  "Follower counts",
  "The algorithm",
  "Infinite scroll",
  "Suggested people",
  "Notifications, all day",
  "Strangers",
];

/**
 * Most products list what they added. The argument here is subtraction, so the
 * list strikes itself through as you reach it.
 */
export function Removals() {
  const ref = useRef<HTMLUListElement>(null);
  const shown = useRevealed(ref);

  return (
    <MotionConfig reducedMotion="user">
      <ul ref={ref} className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {REMOVED.map((item, index) => (
          <li key={item} className="relative w-fit">
            <motion.span
              className="removal font-display text-2xl sm:text-3xl"
              initial={{ opacity: 0, x: -6 }}
              animate={shown ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.45, delay: index * 0.07 }}
            >
              {item}
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="absolute top-1/2 left-0 h-px bg-accent"
              initial={{ width: 0 }}
              animate={shown ? { width: "100%" } : undefined}
              transition={{
                duration: 0.45,
                delay: 0.25 + index * 0.07,
                ease: [0.22, 0.61, 0.32, 1],
              }}
            />
          </li>
        ))}
      </ul>
    </MotionConfig>
  );
}
