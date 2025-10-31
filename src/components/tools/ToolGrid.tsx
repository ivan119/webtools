import { ToolCard } from "./ToolCard";

type Tool = { id: string; title: string; desc: string; href: string };

export function ToolGrid({ items }: { items: Tool[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((t) => (
        <ToolCard key={t.id} title={t.title} desc={t.desc} href={t.href} />
      ))}
    </div>
  );
}
