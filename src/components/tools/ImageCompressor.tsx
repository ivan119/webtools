"use client";

import React, { useCallback, useMemo, useState } from "react";
import { FileUpload, RangeSlider, Select, Button } from "../shared";

type QueuedFile = {
  id: string;
  file: File;
  error?: string;
  resultUrl?: string;
  resultName?: string;
  originalSize?: number;
  compressedSize?: number;
};

type TargetFormat = "auto" | "image/jpeg" | "image/webp" | "image/png";

const MAX_FILES = 20;
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

function readAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

async function compressImage(
  file: File,
  quality: number,
  target: TargetFormat
): Promise<Blob> {
  const img = await readAsImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx?.drawImage(img, 0, 0);

  const mimeType: string =
    target === "auto" ? (file.type || "image/jpeg") : target;

  return new Promise((resolve, reject) => {
    // PNG ignores quality per spec; others use quality
    const q = mimeType === "image/png" ? undefined : quality;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Compression failed"));
      },
      mimeType,
      q as any
    );
  });
}

export default function ImageCompressor() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("auto");

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
        if (!file.type.startsWith("image/")) {
          return { id, file, error: "Only image files are supported" } as QueuedFile;
        }
        if (file.size > MAX_SIZE_BYTES) {
          return { id, file, error: "Max size is 25MB" } as QueuedFile;
        }
        return { id, file, originalSize: file.size } as QueuedFile;
      });
      return [...prev, ...toAdd];
    });
  }, []);

  const handleCompress = useCallback(async () => {
    const updatedQueue = [...queue];
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.error || item.resultUrl) continue;
      try {
        const blob = await compressImage(item.file, quality, targetFormat);
        const ext =
          targetFormat === "auto"
            ? item.file.type.includes("png")
              ? "png"
              : item.file.type.includes("webp")
              ? "webp"
              : "jpg"
            : targetFormat.replace("image/", "");
        const fname = item.file.name.replace(/\.[^/.]+$/, `-compressed.${ext}`);
        const url = URL.createObjectURL(blob);
        updatedQueue[i] = {
          ...item,
          resultUrl: url,
          resultName: fname,
          compressedSize: blob.size,
        };
      } catch (err) {
        updatedQueue[i] = { ...item, error: "Compression failed" };
      }
    }
    setQueue(updatedQueue);
  }, [queue, quality, targetFormat]);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setQueue([]);
  }, [queue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Image Compressor</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Reduce image file size with adjustable quality and format.
        </p>
      </div>

      <FileUpload accept="image/*" multiple maxFiles={MAX_FILES} maxSizeBytes={MAX_SIZE_BYTES} onFilesSelected={addFiles}>
        <div className="text-sm">Drop image files here, or click to select them manually!</div>
        <div className="text-xs text-neutral-500">Up to 20 images, max 25MB each.</div>
      </FileUpload>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RangeSlider label="Quality" value={quality} onChange={setQuality} min={0.1} max={1} step={0.05} showValue unit="%" />
        <Select
          label="Target Format"
          value={targetFormat}
          onChange={(v) => setTargetFormat(v as TargetFormat)}
          options={[
            { value: "auto", label: "Auto (keep format)" },
            { value: "image/jpeg", label: "JPEG" },
            { value: "image/webp", label: "WebP" },
            { value: "image/png", label: "PNG" },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleCompress} disabled={pendingCount === 0}>Compress {pendingCount > 0 ? `(${pendingCount})` : ""}</Button>
        {queue.length > 0 && (
          <Button onClick={clearQueue} variant="secondary">Clear All</Button>
        )}
        <span className="text-sm text-neutral-500">Your compressed images will appear here.</span>
      </div>

      {queue.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((q) => (
            <li key={q.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
              <div className="text-sm font-medium truncate" title={q.file.name}>{q.file.name}</div>
              <div className="text-xs text-neutral-500">
                {typeof q.originalSize === "number" && typeof q.compressedSize === "number"
                  ? `${(q.originalSize / 1024).toFixed(0)} KB → ${(q.compressedSize / 1024).toFixed(0)} KB`
                  : `${(q.file.size / 1024).toFixed(0)} KB`}
              </div>
              {q.error ? (
                <div className="text-xs text-red-600">{q.error}</div>
              ) : q.resultUrl ? (
                <div className="flex items-center justify-between gap-2">
                  <img src={q.resultUrl} alt={q.resultName || "compressed"} className="h-8 w-8 object-cover rounded" />
                  <a href={q.resultUrl} download={q.resultName || "compressed"} className="text-sm underline">Download</a>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">Ready to compress</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


