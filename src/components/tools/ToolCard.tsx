"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ToolCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-lg bg-white/5 border border-cyan-400/20 hover:border-cyan-400/50 transition"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-purple-600/10 opacity-50" />
      <h3 className="text-xl font-bold text-cyan-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{desc}</p>
      <Link
        href={href}
        className="text-purple-400 hover:text-cyan-300 font-semibold"
      >
        Open Tool →
      </Link>
    </motion.div>
  );
}
