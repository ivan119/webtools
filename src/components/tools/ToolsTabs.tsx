"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ToolItem } from "../../data/tools";
import { ToolGrid } from "./ToolGrid";

type Props = {
  items: ToolItem[];
  initialCategory?: string;
};

const CATEGORY_ORDER = ["images", "text", "seo", "other"] as const;

export function ToolsTabs({ items, initialCategory }: Props) {
  const t = useTranslations();

  const getCategoryLabel = (cat: string): string => {
    switch (cat) {
      case "images":
        return t("categoryLabels.images");
      case "text":
        return t("categoryLabels.text");
      case "seo":
        return t("categoryLabels.seo");
      case "other":
        return t("categoryLabels.other");
      default:
        return cat;
    }
  };

  const groups = useMemo(() => {
    const g = items.reduce<Record<string, ToolItem[]>>((acc, tl) => {
      (acc[tl.category] ||= []).push(tl);
      return acc;
    }, {});
    // ensure deterministic order
    const ordered: [string, ToolItem[]][] = [];
    CATEGORY_ORDER.forEach((c) => {
      if (g[c]) ordered.push([c, g[c]]);
    });
    Object.entries(g).forEach(([c, arr]) => {
      if (!CATEGORY_ORDER.includes(c as any)) ordered.push([c, arr]);
    });
    return ordered;
  }, [items]);

  const defaultTab =
    initialCategory && groups.find(([c]) => c === initialCategory)?.[0];
  const [active, setActive] = useState<string>(
    defaultTab || groups[0]?.[0] || ""
  );

  const ICONS: Record<string, string> = {
    images: "🖼️",
    text: "✍️",
    seo: "🔎",
    other: "🧰",
  };

  const STYLE: Record<
    string,
    { active: string; inactive: string; ring: string; badge: string }
  > = {
    images: {
      active: "bg-cyan-600/90 text-white dark:bg-cyan-400/90 dark:text-black",
      inactive:
        "border-cyan-400/80 dark:border-cyan-600 hover:bg-cyan-500/5 dark:hover:bg-cyan-400/10",
      ring: "focus-visible:ring-cyan-500",
      badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
    },
    text: {
      active:
        "bg-violet-600/90 text-white dark:bg-violet-400/90 dark:text-black",
      inactive:
        "border-violet-400/80 dark:border-violet-600 hover:bg-violet-500/5 dark:hover:bg-violet-400/10",
      ring: "focus-visible:ring-violet-500",
      badge:
        "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    },
    seo: {
      active: "bg-amber-500/95 text-black dark:bg-amber-400/90 dark:text-black",
      inactive:
        "border-amber-400/80 dark:border-amber-600 hover:bg-amber-500/5 dark:hover:bg-amber-400/10",
      ring: "focus-visible:ring-amber-500",
      badge:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    },
    other: {
      active:
        "bg-slate-800/90 text-white dark:bg-slate-200/90 dark:text-slate-900",
      inactive:
        "border-slate-400/80 dark:border-slate-600 hover:bg-slate-500/5 dark:hover:bg-slate-400/10",
      ring: "focus-visible:ring-slate-500",
      badge:
        "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200",
    },
  };

  const GLOW_HEX: Record<string, string> = {
    images: "#22d3ee",
    text: "#a78bfa",
    seo: "#f59e0b",
    other: "#94a3b8",
  };

  if (groups.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="relative overflow-x-auto no-scrollbar" role="tablist">
        <div className="inline-flex gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-1 shadow-sm backdrop-blur supports-backdrop-filter:bg-white/40 supports-backdrop-filter:dark:bg-neutral-900/40">
          {groups.map(([cat, arr]) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${cat}`}
                onClick={() => setActive(cat)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm capitalize whitespace-nowrap outline-none border cursor-pointer transform-gpu transition-all duration-200 ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow ring-1 ring-black/5 dark:ring-white/10 hover:shadow-lg hover:-translate-y-0.5"
                    : "border-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 hover:shadow-md hover:-translate-y-0.5"
                } focus-visible:ring-2 focus-visible:ring-neutral-500 dark:focus-visible:ring-neutral-400`}
                style={
                  isActive
                    ? {
                        boxShadow: `0 0 10px ${
                          GLOW_HEX[cat] || GLOW_HEX.other
                        }40, 0 0 18px ${
                          (GLOW_HEX[cat] || GLOW_HEX.other) + "60"
                        }`,
                      }
                    : undefined
                }
              >
                <span className="align-[-2px]">
                  {ICONS[cat] || ICONS.other}
                </span>
                <span>{getCategoryLabel(cat)}</span>
                <span
                  className={`ml-1 inline-flex items-center justify-center rounded-full px-1.5 text-[10px] ${
                    isActive
                      ? "bg-white/20 dark:bg-black/10"
                      : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {arr.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {groups.map(([cat, arr]) => (
        <div
          key={cat}
          hidden={active !== cat}
          role="tabpanel"
          id={`panel-${cat}`}
          aria-labelledby={`tab-${cat}`}
        >
          <ToolGrid items={arr} />
        </div>
      ))}
    </div>
  );
}
