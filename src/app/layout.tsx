import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NextIntlClientProvider } from "next-intl";
import { Navbar } from "../components/chrome/Navbar";
import { Footer } from "../components/chrome/Footer";

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

export default function RootLayout(props: RootLayoutProps) {
  const { children } = props;
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://images.pexels.com"
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <NuqsAdapter>
            <Navbar />
            {children}
            <Footer />
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
