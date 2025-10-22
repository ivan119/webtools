import { ToolGrid } from "./ToolGrid";
import { tools } from "../../data/tools";
import { useTranslations } from "next-intl";

export function FeaturedTools() {
  const t = useTranslations();
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-12">
      <h2 className="text-2xl font-semibold mb-6">{t("featured")}</h2>
      <ToolGrid items={tools.slice(0, 6)} />
    </section>
  );
}
