import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Universal Tools 2099",
  description: "Future-grade tools for the digital world.",
};

type Props = { children: React.ReactNode };

export default async function LocaleLayout({ children }: Props) {
  return children as React.ReactNode;
}
