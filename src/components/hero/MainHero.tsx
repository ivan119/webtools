"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

export function MainHero() {
  const t = useTranslations("hero");
  const prefersReducedMotion = useReducedMotion();
  return (
    <section className="relative z-10 pt-10 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(12,45,75,0.4),#020617_70%)] animate-pulse" />
      <motion.h1
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-extrabold bg-linear-to-r from-cyan-400 via-purple-500 to-blue-400 bg-clip-text text-transparent"
      >
        {t("title")}
      </motion.h1>
      <motion.p
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 max-w-2xl mx-auto text-slate-400"
      >
        {t("tagline")}
      </motion.p>
    </section>
  );
}
