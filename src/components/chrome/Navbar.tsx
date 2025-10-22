"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LocaleSwitcher } from "./LocaleSwitcher";
export function Navbar() {
  const t = useTranslations("nav");
  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between glass rounded-b-xl">
        <div className="text-sm uppercase tracking-wide text-white/70">
          <span className="font-[var(--font-orbitron)] tracking-widest text-cyan-300">
            UT
          </span>
        </div>
        <nav className="flex items-center gap-6 text-white/70">
          {[
            { href: "./", label: t("home") },
            { href: "tools", label: t("tools") },
            { href: "about", label: t("about") },
            { href: "contact", label: t("contact") },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className="relative hover:text-white group"
            >
              <span>{item.label}</span>
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          <form action="tools" className="flex items-center">
            <input
              name="q"
              placeholder={t("searchPlaceholder" as any) as unknown as string}
              className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm"
            />
          </form>
          <button className="px-3 py-1.5 rounded-md border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 text-sm">
            {t("connectWallet" as any) as unknown as string}
          </button>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
