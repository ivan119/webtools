import { tools as allTools } from "../../data/tools";
import { ToolGrid } from "../../components/tools/ToolGrid";
import ToolRouter from "../../components/tools/ToolRouter";
import { getTranslations } from "next-intl/server";
import type { ToolItem } from "../../data/tools";
import { ToolsTabs } from "../../components/tools/ToolsTabs";

// export const revalidate = 3600;

type ToolsPageProps = {
  searchParams: Promise<{ q?: string; tool?: string }>;
};

export default async function ToolsPage(props: ToolsPageProps) {
  const { searchParams } = props;
  const { q, tool } = await searchParams;
  const t = await getTranslations();

  // If a specific tool is selected, show only that tool
  if (tool) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
        <ToolRouter toolId={tool as any} />
      </div>
    );
  }

  // Otherwise show the tools grid grouped by category
  const filtered: ToolItem[] = q
    ? allTools.filter((tl) =>
        tl.title.toLowerCase().includes(String(q).toLowerCase())
      )
    : allTools;
  const groups = filtered.reduce<Record<string, ToolItem[]>>((acc, tl) => {
    (acc[tl.category] ||= []).push(tl);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
      <h1 className="text-3xl font-semibold mb-6">{t("allTools")}</h1>
      <ToolsTabs items={filtered} />
    </div>
  );
}
