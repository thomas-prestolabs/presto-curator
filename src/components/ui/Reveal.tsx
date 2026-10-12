"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & {
  /** Seconds to wait before the element animates in */
  delay?: number;
  /** Pixels the element travels while fading in */
  distance?: number;
};

/**
 * Fades + lifts children in once, the first time they scroll into view.
 * Respects the user's reduced-motion preference.
 */
export default function Reveal({ delay = 0, distance = 24, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
