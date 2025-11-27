"use client";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LocaleSwitcher } from "./LocaleSwitcher";
export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const pathNoLocale = (() => {
    if (!pathname) return "/";
    if (pathname === `/${locale}`) return "/";
    const prefix = `/${locale}/`;
    return pathname.startsWith(prefix)
      ? pathname.slice(prefix.length - 1)
      : pathname;
  })();
  return (
    <header className="relative z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between glass rounded-b-xl">
        <div className="text-sm uppercase tracking-wide text-white/70">
          <span className="font-(--font-orbitron) tracking-widest text-cyan-300">
            UT
          </span>
        </div>
        <nav className="flex items-center gap-6 text-white/70">
          {[
            { href: "/", label: t("home") },
            { href: "/tools", label: t("tools") },
            { href: "/about", label: t("about") },
            { href: "/contact", label: t("contact") },
          ].map((item) => {
            const isActive =
              item.href === "/"
                ? pathNoLocale === "/"
                : pathNoLocale === item.href ||
                  pathNoLocale.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`relative group ${
                  isActive ? "text-white" : "hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-linear-to-r from-cyan-400 to-purple-500 transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          <form action="/tools" className="flex items-center">
            <input
              name="q"
              placeholder={t("searchPlaceholder" as any) as unknown as string}
              className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm"
            />
          </form>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
