"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import JpegToPngConverter from "./images/JpegToPngConverter";
import PngToJpgConverter from "./PngToJpgConverter";
import WebpToPngConverter from "./WebpToPngConverter";
import WebpToJpgConverter from "./WebpToJpgConverter";
import ImageCompressor from "./ImageCompressor";
import HeicToJpgConverter from "./HeicToJpgConverter";
import AvifToJpgConverter from "./AvifToJpgConverter";
import JpgToAvifConverter from "./JpgToAvifConverter";
import SvgToWebpConverter from "./images/SvgToWebpConverter";
import ImageToSvgConverter from "./images/ImageToSvgConverter";
import ImageResizer from "./images/ImageResizer";
import PngToIcoConverter from "./images/PngToIcoConverter";
import WordCounter from "./text/WordCounter";
import JsonFormatter from "./text/JsonFormatter";
import MetaTagPreview from "./seo/MetaTagPreview";
import HashGenerator from "./other/HashGenerator";
import QRCodeGenerator from "./QRCodeGenerator";
import ImageMetadataViewer from "./ImageMetadataViewer";
import GlassmorphismGenerator from "./GlassmorphismGenerator";

type ToolId =
  | "jpeg-to-png"
  | "png-to-jpg"
  | "compress-image"
  | "webp-to-png"
  | "webp-to-jpg"
  | "heic-to-jpg"
  | "avif-to-jpg"
  | "jpg-to-avif"
  | "svg-to-webp"
  | "image-to-svg"
  | "word-counter"
  | "image-resizer"
  | "meta-preview"
  | "hash-generator"
  | "png-to-ico"
  | "json-formatter"
  | "qr-code-generator"
  | "image-metadata-viewer"
  | "glassmorphism-generator";

interface ToolRouterProps {
  toolId: ToolId | null;
}

const toolComponents: Record<ToolId, React.ComponentType> = {
  "jpeg-to-png": JpegToPngConverter,
  "png-to-jpg": PngToJpgConverter,
  "compress-image": ImageCompressor,
  "webp-to-png": WebpToPngConverter,
  "webp-to-jpg": WebpToJpgConverter,
  "heic-to-jpg": HeicToJpgConverter,
  "avif-to-jpg": AvifToJpgConverter,
  "jpg-to-avif": JpgToAvifConverter,
  "svg-to-webp": SvgToWebpConverter,
  "image-to-svg": ImageToSvgConverter,
  "word-counter": WordCounter,
  "image-resizer": ImageResizer,
  "meta-preview": MetaTagPreview,
  "hash-generator": HashGenerator,
  "png-to-ico": PngToIcoConverter,
  "json-formatter": JsonFormatter,
  "qr-code-generator": QRCodeGenerator,
  "image-metadata-viewer": ImageMetadataViewer,
  "glassmorphism-generator": GlassmorphismGenerator,
};

export default function ToolRouter({ toolId }: ToolRouterProps) {
  const t = useTranslations();

  if (!toolId || !toolComponents[toolId]) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
          {t("tools.selectTool")}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-500">
          {t("tools.chooseTool")}
        </p>
      </div>
    );
  }

  const ToolComponent = toolComponents[toolId];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link
          href="/tools"
          className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← {t("tools.backToTools")}
        </Link>
      </div>
      <ToolComponent />
    </div>
  );
}
