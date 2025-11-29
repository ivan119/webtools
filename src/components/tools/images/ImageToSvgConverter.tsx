"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileUpload, Button, Checkbox } from "../../shared";

type QueuedFile = {
  id: string;
  file: File;
  error?: string;
  resultUrl?: string;
  resultName?: string;
};

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB for raster inputs

function blobToDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string, t: any): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(t("errors.loadFailed")));
    img.src = src;
  });
}

async function rasterToSvg1to1(file: File, t: any): Promise<Blob> {
  const dataUrl = await blobToDataURL(file);
  const img = await loadImage(dataUrl, t);
  const w = Math.max(1, img.naturalWidth || img.width);
  const h = Math.max(1, img.naturalHeight || img.height);

  const svg =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<image href="${dataUrl}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none"/>` +
    `</svg>`;

  return new Blob([svg], { type: "image/svg+xml" });
}

export default function ImageToSvgConverter() {
  const t = useTranslations("imageToSvg");
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [agreeRecent, setAgreeRecent] = useState<boolean>(false);
  const inputKeyRef = useRef<number>(0);

  const pendingCount = useMemo(
    () => queue.filter((q) => !q.resultUrl && !q.error).length,
    [queue]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      setQueue((prev) => {
        const remaining = Math.max(0, MAX_FILES - prev.length);
        const toAdd = arr.slice(0, remaining).map((file, idx) => {
          const id = `${Date.now()}-${idx}-${file.name}`;
          const isRaster =
            /image\/(png|jpeg|jpg|webp|gif|bmp)/i.test(file.type) ||
            /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
          if (!isRaster) {
            return {
              id,
              file,
              error: t("errors.supportedFormats"),
            } as QueuedFile;
          }
          if (file.size > MAX_SIZE_BYTES) {
            return { id, file, error: t("errors.maxSize") } as QueuedFile;
          }
          return { id, file } as QueuedFile;
        });
        return [...prev, ...toAdd];
      });
      inputKeyRef.current++;
    },
    [t]
  );

  const handleConvert = useCallback(async () => {
    const updated = [...queue];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (item.error || item.resultUrl) continue;
      try {
        const svgBlob = await rasterToSvg1to1(item.file, t);
        const fname =
          item.file.name.replace(/\.(png|jpe?g|webp|gif|bmp)$/i, "") + ".svg";
        const url = URL.createObjectURL(svgBlob);
        updated[i] = { ...item, resultUrl: url, resultName: fname };
      } catch (e) {
        updated[i] = { ...item, error: t("errors.conversionFailed") };
      }
    }
    setQueue(updated);
  }, [queue, t]);

  const clearQueue = useCallback(() => {
    queue.forEach((q) => q.resultUrl && URL.revokeObjectURL(q.resultUrl));
    setQueue([]);
  }, [queue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>
      </div>

      <FileUpload
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp"
        multiple
        maxFiles={MAX_FILES}
        maxSizeBytes={MAX_SIZE_BYTES}
        onFilesSelected={addFiles}
        className=""
      >
        <div className="text-sm">{t("dropFiles")}</div>
        <div className="text-xs text-neutral-500">{t("fileLimits")}</div>
      </FileUpload>

      <Checkbox
        label={t("agreeRecent")}
        checked={agreeRecent}
        onChange={setAgreeRecent}
      />

      <div className="flex items-center gap-3">
        <Button onClick={handleConvert} disabled={pendingCount === 0}>
          {t("convert")} {pendingCount > 0 ? `(${pendingCount})` : ""}
        </Button>
        {queue.length > 0 && (
          <Button onClick={clearQueue} variant="secondary">
            {t("clearAll")}
          </Button>
        )}
        <span className="text-sm text-neutral-500">{t("filesWillAppear")}</span>
      </div>

      {queue.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((q) => (
            <li
              key={q.id}
              className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3 space-y-2"
            >
              <div className="text-sm font-medium truncate" title={q.file.name}>
                {q.file.name}
              </div>
              <div className="text-xs text-neutral-500">
                {(q.file.size / 1024 / 1024).toFixed(2)} MB
              </div>
              {q.error ? (
                <div className="text-xs text-red-600">{q.error}</div>
              ) : q.resultUrl ? (
                <div className="flex items-center justify-between gap-2">
                  <img
                    src={q.resultUrl}
                    alt={q.resultName || t("converted")}
                    className="h-8 w-8 object-cover rounded"
                  />
                  <a
                    href={q.resultUrl}
                    download={q.resultName || "converted.svg"}
                    className="text-sm underline"
                  >
                    {t("downloadSvg")}
                  </a>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  {t("readyToConvert")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
