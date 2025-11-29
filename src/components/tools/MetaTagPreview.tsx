"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { TextArea, Button, NumberInput } from "../shared";

type MetaData = {
  title: string;
  description: string;
  url: string;
  image?: string;
};

type PreviewPlatform = "google" | "facebook" | "twitter";

export default function MetaTagPreview() {
  const t = useTranslations("metaTagPreview");
  const [metaData, setMetaData] = useState<MetaData>({
    title: "",
    description: "",
    url: "",
    image: "",
  });
  const [selectedPlatform, setSelectedPlatform] =
    useState<PreviewPlatform>("google");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof MetaData, value: string) => {
    setMetaData((prev) => ({ ...prev, [field]: value }));
  };

  const generateFromUrl = async () => {
    const url = urlInputRef.current?.value?.trim();
    if (!url) return;

    setIsGenerating(true);
    setError(null);
    try {
      // This would typically call an API to fetch meta tags
      // For now, we'll simulate with a placeholder
      const response = await fetch(
        `/api/meta-scraper?url=${encodeURIComponent(url)}`
      );
      if (response.ok) {
        const data = await response.json();
        setMetaData((prev) => ({
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          url: url,
          image: data.image || prev.image,
        }));
      } else {
        // Fallback: just set the URL
        setMetaData((prev) => ({ ...prev, url }));
        setError(t("errors.couldNotFetch"));
      }
    } catch (error) {
      // Fallback: just set the URL
      setMetaData((prev) => ({ ...prev, url }));
      setError(t("errors.fetchFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMetaTags = async () => {
    const metaTags = `<!-- Primary Meta Tags -->
<title>${metaData.title}</title>
<meta name="title" content="${metaData.title}">
<meta name="description" content="${metaData.description}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${metaData.url}">
<meta property="og:title" content="${metaData.title}">
<meta property="og:description" content="${metaData.description}">
${
  metaData.image ? `<meta property="og:image" content="${metaData.image}">` : ""
}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${metaData.url}">
<meta property="twitter:title" content="${metaData.title}">
<meta property="twitter:description" content="${metaData.description}">
${
  metaData.image
    ? `<meta property="twitter:image" content="${metaData.image}">`
    : ""
}`;

    try {
      await navigator.clipboard.writeText(metaTags);
      alert(t("copySuccess"));
    } catch (err) {
      alert(t("copyFailed"));
    }
  };

  const renderPreview = () => {
    switch (selectedPlatform) {
      case "google":
        return (
          <div className="bg-white border border-neutral-200 rounded-lg p-4 max-w-2xl">
            <div className="text-blue-600 text-sm hover:underline cursor-pointer">
              {metaData.url || "https://example.com"}
            </div>
            <div className="text-xl text-blue-600 hover:underline cursor-pointer font-medium mt-1">
              {metaData.title || t("previewLabels.defaultTitle")}
            </div>
            <div className="text-sm text-neutral-600 mt-1">
              {metaData.description || t("previewLabels.defaultDescription")}
            </div>
          </div>
        );

      case "facebook":
        return (
          <div className="bg-white border border-neutral-200 rounded-lg max-w-md overflow-hidden">
            {metaData.image && (
              <img
                src={metaData.image}
                alt={metaData.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="p-3">
              <div className="text-xs text-neutral-500 uppercase tracking-wide">
                {metaData.url ? new URL(metaData.url).hostname : "example.com"}
              </div>
              <div className="text-sm font-semibold mt-1">
                {metaData.title || t("previewLabels.defaultTitle")}
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                {metaData.description || t("previewLabels.defaultDescription")}
              </div>
            </div>
          </div>
        );

      case "twitter":
        return (
          <div className="bg-white border border-neutral-200 rounded-lg max-w-md overflow-hidden">
            {metaData.image && (
              <img
                src={metaData.image}
                alt={metaData.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="p-3">
              <div className="text-xs text-neutral-500">
                {metaData.url ? new URL(metaData.url).hostname : "example.com"}
              </div>
              <div className="text-sm font-semibold mt-1">
                {metaData.title || t("previewLabels.defaultTitle")}
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                {metaData.description || t("previewLabels.defaultDescription")}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {t("generateFromUrl")}
        </label>
        <div className="flex gap-2">
          <input
            ref={urlInputRef}
            type="url"
            placeholder={t("urlPlaceholder")}
            className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
          />
          <button
            onClick={generateFromUrl}
            disabled={isGenerating}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
          >
            {isGenerating ? t("generating") : t("generate")}
          </button>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
      </div>

      {/* Meta Data Input */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("metaData")}</h2>

          <TextArea
            label={t("titleLabel")}
            value={metaData.title}
            onChange={(value) => handleInputChange("title", value)}
            placeholder={t("titlePlaceholder")}
            rows={2}
            maxLength={60}
            showCharCount={true}
          />

          <TextArea
            label={t("descriptionLabel")}
            value={metaData.description}
            onChange={(value) => handleInputChange("description", value)}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
            maxLength={160}
            showCharCount={true}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">{t("urlLabel")}</label>
            <input
              type="url"
              value={metaData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              placeholder={t("urlPlaceholder")}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t("imageUrlLabel")}
            </label>
            <input
              type="url"
              value={metaData.image || ""}
              onChange={(e) => handleInputChange("image", e.target.value)}
              placeholder={t("imageUrlPlaceholder")}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
            />
          </div>

          <Button onClick={copyMetaTags} className="w-full">
            {t("copyMetaTags")}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("preview")}</h2>
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-md p-1">
              {(["google", "facebook", "twitter"] as PreviewPlatform[]).map(
                (platform) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`px-3 py-1 text-xs rounded capitalize ${
                      selectedPlatform === platform
                        ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    {t(`platforms.${platform}`)}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {selectedPlatform === "google" &&
                t("previewLabels.googleResults")}
              {selectedPlatform === "facebook" &&
                t("previewLabels.facebookPost")}
              {selectedPlatform === "twitter" && t("previewLabels.twitterCard")}
            </div>
            {renderPreview()}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t("tips.title")}
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t("tips.tip1")}</li>
              <li>• {t("tips.tip2")}</li>
              <li>• {t("tips.tip3")}</li>
              <li>• {t("tips.tip4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
