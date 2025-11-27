"use client";

import { useLocale } from "next-intl";
import {
  useRouter,
  getPathname,
  usePathname,
  Link,
} from "../../i18n/navigation";
import { locales } from "../../i18n/routing";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
const languageNames: Record<string, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  es: { name: "Español", flag: "🇪🇸" },
  it: { name: "Italiano", flag: "🇮🇹" },
};

const languages = locales.map((code) => ({
  code,
  ...languageNames[code],
}));

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleClick = (newLocale: string) => {
    setIsOpen(false);

    // Get current search params and preserve them
    const currentSearchParams = searchParams.toString();

    // Build the path with search params preserved
    // pathname from usePathname() is already locale-agnostic
    const pathWithParams = currentSearchParams
      ? `${pathname}?${currentSearchParams}`
      : pathname;

    // Use router.push to navigate without full page refresh
    // Pass the pathname with query params and locale option
    router.push(pathWithParams, { locale: newLocale });
  };
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white/70 hover:text-white transition-colors text-sm"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline uppercase">
          {currentLanguage.code}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {languages.map((lang) => {
              const href = getPathname({ href: pathname, locale: lang.code });
              const isActive = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${
                    isActive
                      ? "bg-cyan-400/20 text-cyan-300"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-white/10 dark:hover:bg-neutral-800/50"
                  }`}
                  onClick={() => handleClick(lang.code)}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4 ml-auto text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
