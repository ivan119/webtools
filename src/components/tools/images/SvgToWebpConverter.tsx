"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileUpload, Button, RangeSlider, Checkbox } from "../../shared";

type QueuedFile = {
  id: string;
  file: File;
  error?: string;
  resultUrl?: string;
  resultName?: string;
};

const MAX_FILES = 20;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB for SVG

function parseSvgDimensions(svgText: string): {
  width: number;
  height: number;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;
    const rawWidth = svg.getAttribute("width");
    const rawHeight = svg.getAttribute("height");
    const toPx = (val: string | null): number | null => {
      if (!val) return null;
      const s = String(val).trim();
      const unitMatch = s.match(/[a-z%]+$/i);
      if (unitMatch && unitMatch[0].toLowerCase() !== "px") {
        return null;
      }
      const match = s.match(/([0-9]*\.?[0-9]+)/);
      if (!match) return null;
      const n = parseFloat(match[1]);
      return isFinite(n) && n > 0 ? n : null;
    };
    const wPx = toPx(rawWidth);
    const hPx = toPx(rawHeight);
    if (wPx && hPx) return { width: wPx, height: hPx };
    const viewBox = svg.getAttribute("viewBox") || svg.getAttribute("viewbox");
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map((p) => parseFloat(p));
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: parts[2], height: parts[3] };
      }
    }
    return { width: 1024, height: 1024 };
  } catch {
    return { width: 1024, height: 1024 };
  }
}

async function inlineExternalImages(svgText: string): Promise<string> {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const XLINK_NS = "http://www.w3.org/1999/xlink";
    const images = Array.from(doc.querySelectorAll("image"));
    for (const img of images) {
      const hrefAttr =
        img.getAttribute("href") || img.getAttributeNS(XLINK_NS, "href");
      if (!hrefAttr || hrefAttr.startsWith("data:")) continue;
      try {
        const res = await fetch(hrefAttr, { mode: "cors" });
        if (!res.ok) continue;
        const blob = await res.blob();
        const dataUrl = await blobToDataURL(blob);
        img.setAttribute("href", dataUrl);
        img.removeAttributeNS(XLINK_NS, "href");
      } catch {
        continue;
      }
    }
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc.documentElement);
  } catch {
    return svgText;
  }
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const parts = dataUrl.split(",");
    if (parts.length < 2) return null;
    const header = parts[0];
    const base64 = parts[1];
    const mimeMatch = header.match(/data:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const byteString = atob(base64);
    const len = byteString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = byteString.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

async function convertSvgToWebp(
  file: File,
  quality: number,
  t: any
): Promise<Blob> {
  let text = await file.text();
  if (!/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/.test(text)) {
    text = text.replace(
      /<svg(\s|>)/i,
      (m) => `<svg xmlns=\"http://www.w3.org/2000/svg\"${m.slice(4)}`
    );
  }
  text = await inlineExternalImages(text).catch(() => text);
  const { width, height } = parseSvgDimensions(text);
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const done = (blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            try {
              const dataUrl = canvas.toDataURL(
                "image/webp",
                Math.min(1, Math.max(0, quality))
              );
              const blobFromDataUrl = dataUrlToBlob(dataUrl);
              if (blobFromDataUrl) resolve(blobFromDataUrl);
              else reject(new Error(t("errors.conversionFailed")));
            } catch {
              reject(new Error(t("errors.conversionFailed")));
            }
          }
        };
        if (canvas.toBlob) {
          canvas.toBlob(done, "image/webp", Math.min(1, Math.max(0, quality)));
        } else {
          done(null);
        }
      } catch {
        reject(new Error(t("errors.conversionFailed")));
      }
    };
    img.onerror = () => {
      reject(new Error(t("errors.loadFailed")));
    };
    const encoded = encodeURIComponent(text)
      .replace(/%20/g, " ")
      .replace(/%3D/g, "=")
      .replace(/%3A/g, ":")
      .replace(/%2F/g, "/");
    img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  });
}

export default function SvgToWebpConverter() {
  const t = useTranslations("svgToWebp");
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [quality, setQuality] = useState<number>(80);
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
        const remainingSlots = Math.max(0, MAX_FILES - prev.length);
        const toAdd = arr.slice(0, remainingSlots).map((file, idx) => {
          const id = `${Date.now()}-${idx}-${file.name}`;
          const isSvgType = file.type.includes("image/svg");
          const isSvgName = /\.svg$/i.test(file.name);
          if (!isSvgType && !isSvgName) {
            return {
              id,
              file,
              error: t("errors.onlySvg"),
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
    const updatedQueue = [...queue];
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.error || item.resultUrl) continue;
      try {
        const webpBlob = await convertSvgToWebp(item.file, quality / 100, t);
        const fname = item.file.name.replace(/\.svg$/i, ".webp");
        const url = URL.createObjectURL(webpBlob);
        updatedQueue[i] = { ...item, resultUrl: url, resultName: fname };
      } catch (err) {
        updatedQueue[i] = { ...item, error: t("errors.conversionFailed") };
      }
    }
    setQueue(updatedQueue);
  }, [queue, quality, t]);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
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
        accept="image/svg+xml,image/svg"
        multiple
        maxFiles={MAX_FILES}
        maxSizeBytes={MAX_SIZE_BYTES}
        onFilesSelected={addFiles}
        className=""
      >
        <div className="text-sm">{t("dropFiles")}</div>
        <div className="text-xs text-neutral-500">{t("fileLimits")}</div>
      </FileUpload>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RangeSlider
          label={t("qualityLabel")}
          value={quality}
          onChange={setQuality}
          min={1}
          max={100}
          step={1}
          unit=""
        />
        <div className="flex items-end">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {t("qualityHint")}
          </span>
        </div>
      </div>

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
                    download={q.resultName || "converted.webp"}
                    className="text-sm underline"
                  >
                    {t("downloadWebp")}
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
