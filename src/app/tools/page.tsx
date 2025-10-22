import { tools as allTools } from "../../data/tools";
import { ToolGrid } from "../../components/tools/ToolGrid";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

type ToolsPageProps = { searchParams: Promise<{ q?: string }> };

export default async function ToolsPage(props: ToolsPageProps) {
  const { searchParams } = props;
  const { q } = await searchParams;
  const t = await getTranslations();
  const tools = q
    ? allTools.filter((tl) =>
        tl.title.toLowerCase().includes(String(q).toLowerCase())
      )
    : allTools;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
      <h1 className="text-3xl font-semibold mb-6">{t("allTools")}</h1>
      <ToolGrid items={tools} />
    </div>
  );
}
