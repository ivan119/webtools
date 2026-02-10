"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function ToolCard({
  id,
  title,
  desc,
  href,
}: {
  id: string;
  title: string;
  desc: string;
  href: string;
}) {
  const t = useTranslations();

  // Try to find localized title and description
  const localizedTitle = t.has(`toolItems.${id}.title`)
    ? t(`toolItems.${id}.title`)
    : title;
  const localizedDesc = t.has(`toolItems.${id}.desc`)
    ? t(`toolItems.${id}.desc`)
    : desc;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-lg bg-white/5 border border-cyan-400/20 hover:border-cyan-400/50 transition cursor-pointer"
      >
        <div className="absolute inset-0 bg-linear-to-tr from-cyan-400/10 via-transparent to-purple-600/10 opacity-50" />
        <h3 className="text-xl font-bold text-cyan-300 mb-2">
          {localizedTitle}
        </h3>
        <p className="text-sm text-slate-400 mb-4">{localizedDesc}</p>
        <div className="text-purple-400 hover:text-cyan-300 font-semibold">
          {t("openTool")} →
        </div>
      </motion.div>
    </Link>
  );
}
