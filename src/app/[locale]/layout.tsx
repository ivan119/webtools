import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Orbitron } from "next/font/google";
import ".././globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NextIntlClientProvider } from "next-intl";

import { Navbar } from "../../components/chrome/Navbar";
import { Footer } from "../../components/chrome/Footer";
import { getLocale, getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Universal Tools 2099",
  description: "Future-grade tools for the digital world.",
};

type RootLayoutProps = { children: React.ReactNode };

export default async function RootLayout(props: RootLayoutProps) {
  const { children } = props;
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="preconnect"
          href="https://images.pexels.com"
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased min-h-dvh flex flex-col`}
      >
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
            <Navbar />
              <div className={'grow h-full'}>
                  {children}
              </div>
            <Footer />
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
