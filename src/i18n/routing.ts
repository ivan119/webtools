import { defineRouting } from 'next-intl/routing';
export const locales = ['en', 'de', 'es', 'it'] as const
export const defaultLocale = 'en'
export type Locale = typeof locales[number]

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: locales as unknown as string[],

  // Used when no locale matches
  defaultLocale
});

