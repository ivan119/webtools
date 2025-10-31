import { tools as allTools } from "../../../data/tools";
import { ToolsTabs } from "../../../components/tools/ToolsTabs";

export default function Page() {
  const items = allTools.filter((t) => t.category === "other");
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10">
      <ToolsTabs items={items} initialCategory="other" />
    </div>
  );
}
