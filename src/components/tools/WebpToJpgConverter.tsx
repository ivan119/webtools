"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { FileUpload, Button } from "../shared";

type QueuedFile = {
  id: string;
  file: File;
  error?: string;
  resultUrl?: string;
  resultName?: string;
};

const MAX_FILES = 20;
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

async function fetchUrlAsFile(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch URL");
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("image/webp")) {
    throw new Error("URL must point to a WebP image");
  }
  const blob = await res.blob();
  if (blob.size > MAX_SIZE_BYTES) {
    throw new Error("Image exceeds 20MB limit");
  }
  return new File([blob], "from-url.webp", { type: "image/webp" });
}

function convertWebpToJpg(file: File, quality: number = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to convert to JPG"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function WebpToJpgConverter() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const urlInputRef = useRef<HTMLInputElement>(null);

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
        if (!file.type.includes("image/webp")) {
          return { id, file, error: "Only WebP files are supported" } as QueuedFile;
        }
        if (file.size > MAX_SIZE_BYTES) {
          return { id, file, error: "Max size is 20MB" } as QueuedFile;
        }
        return { id, file } as QueuedFile;
      });
      return [...prev, ...toAdd];
    });
  }, []);

  const handleConvert = useCallback(async () => {
    const updatedQueue = [...queue];
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.error || item.resultUrl) continue;
      try {
        const jpgBlob = await convertWebpToJpg(item.file);
        const fname = item.file.name.replace(/\.webp$/i, ".jpg");
        const url = URL.createObjectURL(jpgBlob);
        updatedQueue[i] = { ...item, resultUrl: url, resultName: fname };
      } catch (err) {
        updatedQueue[i] = { ...item, error: "Conversion failed" };
      }
    }
    setQueue(updatedQueue);
  }, [queue]);

  const handleConvertFromUrl = useCallback(async () => {
    const url = urlInputRef.current?.value?.trim();
    if (!url) return;
    try {
      const file = await fetchUrlAsFile(url);
      addFiles([file]);
      urlInputRef.current!.value = "";
    } catch (e: any) {
      alert(e?.message || "Failed to fetch URL");
    }
  }, [addFiles]);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setQueue([]);
  }, [queue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">WebP to JPG Converter</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Convert WebP images to JPG with high quality in your browser.</p>
      </div>

      <FileUpload accept="image/webp" multiple maxFiles={MAX_FILES} maxSizeBytes={MAX_SIZE_BYTES} onFilesSelected={addFiles}>
        <div className="text-sm">Drop your .webp files here, or click to select them manually!</div>
        <div className="text-xs text-neutral-500">Up to 20 files, max 20MB each.</div>
      </FileUpload>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input ref={urlInputRef} type="url" placeholder="https://example.com/image.webp" className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
        <button onClick={handleConvertFromUrl} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900">Convert from URL</button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleConvert} disabled={pendingCount === 0}>Convert {pendingCount > 0 ? `(${pendingCount})` : ""}</Button>
        {queue.length > 0 && (
          <Button onClick={clearQueue} variant="secondary">Clear All</Button>
        )}
        <span className="text-sm text-neutral-500">Your JPG files will appear here, once you convert them.</span>
      </div>

      {queue.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((q) => (
            <li key={q.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
              <div className="text-sm font-medium truncate" title={q.file.name}>{q.file.name}</div>
              <div className="text-xs text-neutral-500">{(q.file.size / 1024 / 1024).toFixed(2)} MB</div>
              {q.error ? (
                <div className="text-xs text-red-600">{q.error}</div>
              ) : q.resultUrl ? (
                <div className="flex items-center justify-between gap-2">
                  <img src={q.resultUrl} alt={q.resultName || "converted"} className="h-8 w-8 object-cover rounded" />
                  <a href={q.resultUrl} download={q.resultName || "converted.jpg"} className="text-sm underline">Download JPG</a>
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


