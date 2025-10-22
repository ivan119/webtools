import Link from "next/link";
import { useTranslations } from "next-intl";

export function ToolCategories() {
  const t = useTranslations();
  const categories = [
    {
      title: "Convert",
      desc: "File and media conversion tools",
      href: "/tools",
    },
    { title: "Analyze", desc: "Text and SEO analyzers", href: "/tools" },
    { title: "Optimize", desc: "Images and performance", href: "/tools" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-12">
      <h2 className="text-2xl font-semibold mb-6">{t("categories")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="block rounded-2xl p-6 bg-white/5 border border-cyan-400/20 hover:border-cyan-400/40 transition"
          >
            <div className="text-cyan-300 font-semibold mb-1">{c.title}</div>
            <div className="text-slate-400 text-sm">{c.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
