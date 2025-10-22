import { useTranslations } from "next-intl";

export function AdBanner() {
  const t = useTranslations();
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-8">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-400/30 text-slate-300">
        <div className="text-sm">{t("promoted")}</div>
        <div className="mt-1 text-lg">{t("upgrade")}</div>
      </div>
    </section>
  );
}
