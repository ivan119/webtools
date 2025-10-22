"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./Hero.module.css";

type Props = {
  title: string;
  subtitle?: string;
};

export function Hero({ title, subtitle }: Props) {
  const heading = useMemo(() => title, [title]);
  const sub = useMemo(() => subtitle, [subtitle]);
  const prefersReducedMotion = useReducedMotion();
  const transition = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.8, ease: "easeOut" },
    [prefersReducedMotion]
  );

  return (
    <section className={`${styles.hero} relative w-full`} aria-label="Hero">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
      <div className={styles.noiseOverlay} />
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={transition}
        className={`${styles.glassCard} mx-auto max-w-3xl px-8 py-10 text-center`}
      >
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
          {heading}
        </h1>
        {sub ? (
          <p className="mt-4 text-base sm:text-lg text-white/70">{sub}</p>
        ) : null}
      </motion.div>
    </section>
  );
}
