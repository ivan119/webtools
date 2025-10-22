import { Suspense } from "react";
import { Hero } from "../components/hero/Hero";
import { ClientGallery } from "../components/gallery/ClientGallery";
import { Navbar } from "../components/chrome/Navbar";
import { Footer } from "../components/chrome/Footer";
import { BackgroundFX } from "../components/fx/BackgroundFX";
import { MainHero } from "../components/hero/MainHero";
import { ToolCategories } from "../components/tools/ToolCategories";
import { FeaturedTools } from "../components/tools/FeaturedTools";
import { AdBanner } from "../components/ads/AdBanner";
import { CommandPalette } from "../components/chrome/CommandPalette";
import { listAllImages } from "../controllers/gallery";
export const revalidate = 3600;

export default async function Home() {
  const images = await listAllImages({});
  return (
    <div className="min-h-screen">
      <BackgroundFX />
      <Navbar />
      <CommandPalette />
      <MainHero />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
        <ToolCategories />
        <FeaturedTools />
        <AdBanner />
        <ClientGallery images={images} />
      </main>
      <Footer />
    </div>
  );
}
