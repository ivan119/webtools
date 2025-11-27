import { Suspense } from "react";
import { Hero } from "../../components/hero/Hero";
import { ClientGallery } from "../../components/gallery/ClientGallery";
import { Navbar } from "../../components/chrome/Navbar";
import { Footer } from "../../components/chrome/Footer";
import { BackgroundFX } from "../../components/fx/BackgroundFX";
import { MainHero } from "../../components/hero/MainHero";
import { FeaturedTools } from "../../components/tools/FeaturedTools";
import { CommandPalette } from "../../components/chrome/CommandPalette";

export default async function Home() {
  return (
    <div>
      <BackgroundFX />
      <CommandPalette />
      <MainHero />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
        <FeaturedTools />
      </main>
    </div>
  );
}
