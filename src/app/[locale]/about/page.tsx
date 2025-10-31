import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">{t("about.title")}</h1>
      <p className="text-white/70 leading-7">{t("about.p1")}</p>
      <p className="text-white/70 leading-7 mt-4">{t("about.p2")}</p>
    </div>
  );
}
