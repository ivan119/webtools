"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { FileUpload, Button, RangeSlider, Checkbox } from "../shared";

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

    // Try explicit width/height
    const rawWidth = svg.getAttribute("width");
    const rawHeight = svg.getAttribute("height");

    const toPx = (val: string | null): number | null => {
      if (!val) return null;
      const s = String(val).trim();
      // Only accept unitless or px units; ignore em, rem, %, etc.
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

    // Fallback to viewBox
    const viewBox = svg.getAttribute("viewBox") || svg.getAttribute("viewbox");
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map((p) => parseFloat(p));
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        return { width: parts[2], height: parts[3] };
      }
    }

    // Sensible default
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
        // Ignore failures; leave original href
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

async function convertSvgToWebp(file: File, quality: number): Promise<Blob> {
  let text = await file.text();
  // Ensure xmlns is present for better cross-browser rendering
  if (!/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/.test(text)) {
    text = text.replace(
      /<svg(\s|>)/i,
      (m) => `<svg xmlns=\"http://www.w3.org/2000/svg\"${m.slice(4)}`
    );
  }

  // Attempt to inline external <image href="..."> resources to avoid canvas taint
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
            // Fallback via dataURL if toBlob returns null in some browsers
            try {
              const dataUrl = canvas.toDataURL(
                "image/webp",
                Math.min(1, Math.max(0, quality))
              );
              const blobFromDataUrl = dataUrlToBlob(dataUrl);
              if (blobFromDataUrl) resolve(blobFromDataUrl);
              else reject(new Error("Failed to convert to WEBP"));
            } catch {
              reject(new Error("Failed to convert to WEBP"));
            }
          }
        };

        if (canvas.toBlob) {
          canvas.toBlob(done, "image/webp", Math.min(1, Math.max(0, quality)));
        } else {
          done(null);
        }
      } catch (e) {
        reject(new Error("Conversion failed"));
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load SVG"));
    };

    // Use data URL to avoid potential objectURL/CORS issues across browsers
    const encoded = encodeURIComponent(text)
      // un-escape characters safe for data URLs to reduce size
      .replace(/%20/g, " ")
      .replace(/%3D/g, "=")
      .replace(/%3A/g, ":")
      .replace(/%2F/g, "/");
    img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  });
}

export default function SvgToWebpConverter() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [agreeRecent, setAgreeRecent] = useState<boolean>(false);
  const inputKeyRef = useRef<number>(0);

  const pendingCount = useMemo(
    () => queue.filter((q) => !q.resultUrl && !q.error).length,
    [queue]
  );

  const addFiles = useCallback((files: FileList | File[]) => {
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
            error: "Only SVG files are supported",
          } as QueuedFile;
        }
        if (file.size > MAX_SIZE_BYTES) {
          return { id, file, error: "Max size is 5MB" } as QueuedFile;
        }
        return { id, file } as QueuedFile;
      });
      return [...prev, ...toAdd];
    });
    // force re-render of hidden input to clear file selection
    inputKeyRef.current++;
  }, []);

  const handleConvert = useCallback(async () => {
    const updatedQueue = [...queue];
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.error || item.resultUrl) continue;
      try {
        const webpBlob = await convertSvgToWebp(item.file, quality / 100);
        const fname = item.file.name.replace(/\.svg$/i, ".webp");
        const url = URL.createObjectURL(webpBlob);
        updatedQueue[i] = { ...item, resultUrl: url, resultName: fname };
      } catch (err) {
        updatedQueue[i] = { ...item, error: "Conversion failed" };
      }
    }
    setQueue(updatedQueue);
  }, [queue, quality]);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setQueue([]);
  }, [queue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">SVG to WEBP Converter</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Convert SVG images to efficient WEBP format. Supports multi-upload and
          quality control.
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
        <div className="text-sm">
          Drop your .svg files here, or click to select them!
        </div>
        <div className="text-xs text-neutral-500">
          Up to 20 SVG files, max 5MB each.
        </div>
      </FileUpload>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RangeSlider
          label="WEBP quality"
          value={quality}
          onChange={setQuality}
          min={1}
          max={100}
          step={1}
          unit=""
        />
        <div className="flex items-end">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Default is 80. Higher means better quality and larger file size.
          </span>
        </div>
      </div>

      <Checkbox
        label="I agree to display the image in Recently Converted"
        checked={agreeRecent}
        onChange={setAgreeRecent}
      />

      <div className="flex items-center gap-3">
        <Button onClick={handleConvert} disabled={pendingCount === 0}>
          Convert {pendingCount > 0 ? `(${pendingCount})` : ""}
        </Button>
        {queue.length > 0 && (
          <Button onClick={clearQueue} variant="secondary">
            Clear All
          </Button>
        )}
        <span className="text-sm text-neutral-500">
          Your WEBP files will appear here once converted.
        </span>
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
                    alt={q.resultName || "converted"}
                    className="h-8 w-8 object-cover rounded"
                  />
                  <a
                    href={q.resultUrl}
                    download={q.resultName || "converted.webp"}
                    className="text-sm underline"
                  >
                    Download WEBP
                  </a>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">Ready to convert</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
