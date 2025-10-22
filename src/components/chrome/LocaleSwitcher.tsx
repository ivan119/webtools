"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);
  const current = segs[0] ?? "en";
  const rest = segs.slice(1).join("/");
  const hrefFor = (target: string) => `/${target}${rest ? "/" + rest : ""}`;

  return (
    <div className="flex items-center gap-1 text-xs text-white/70">
      <a
        href={hrefFor("en")}
        className={`px-2 py-1 rounded-md border ${
          locale === "en" || current === "en"
            ? "border-cyan-400/50 text-cyan-300"
            : "border-white/10 hover:bg-white/5"
        }`}
      >
        EN
      </a>
      <a
        href={hrefFor("de")}
        className={`px-2 py-1 rounded-md border ${
          locale === "de" || current === "de"
            ? "border-cyan-400/50 text-cyan-300"
            : "border-white/10 hover:bg-white/5"
        }`}
      >
        DE
      </a>
    </div>
  );
}
