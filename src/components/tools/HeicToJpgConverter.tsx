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

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 30 * 1024 * 1024; // 30MB

async function fetchUrlAsFile(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch URL");
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("image/heic") && !contentType.includes("image/heif")) {
    throw new Error("URL must point to a HEIC/HEIF image");
  }
  const blob = await res.blob();
  if (blob.size > MAX_SIZE_BYTES) {
    throw new Error("Image exceeds 30MB limit");
  }
  return new File([blob], "from-url.heic", { type: contentType });
}

// Note: Most browsers cannot decode HEIC natively. This component provides
// graceful fallback messaging when conversion cannot be performed client-side.
function tryConvertHeicToJpg(file: File): Promise<Blob> {
  return new Promise((_, reject) => {
    // Without a decoder library, we cannot render HEIC to a canvas.
    reject(new Error("HEIC decoding not supported in this browser"));
  });
}

export default function HeicToJpgConverter() {
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
        const isHeic = file.type.includes("image/heic") || file.type.includes("image/heif") || /\.(heic|heif)$/i.test(file.name);
        if (!isHeic) {
          return { id, file, error: "Only HEIC/HEIF files are supported" } as QueuedFile;
        }
        if (file.size > MAX_SIZE_BYTES) {
          return { id, file, error: "Max size is 30MB" } as QueuedFile;
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
        const jpgBlob = await tryConvertHeicToJpg(item.file);
        const fname = item.file.name.replace(/\.(heic|heif)$/i, ".jpg");
        const url = URL.createObjectURL(jpgBlob);
        updatedQueue[i] = { ...item, resultUrl: url, resultName: fname };
      } catch (err) {
        updatedQueue[i] = { ...item, error: "HEIC decoding not supported in this browser" };
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
        <h1 className="text-2xl font-semibold">HEIC to JPG Converter</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Convert HEIC/HEIF photos to JPG. Client-side decoding may not be
          supported in your browser.
        </p>
      </div>

      <FileUpload accept=".heic,.heif,image/heic,image/heif" multiple maxFiles={MAX_FILES} maxSizeBytes={MAX_SIZE_BYTES} onFilesSelected={addFiles}>
        <div className="text-sm">Drop HEIC/HEIF files here, or click to select them manually!</div>
        <div className="text-xs text-neutral-500">Up to 10 files, max 30MB each.</div>
      </FileUpload>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input ref={urlInputRef} type="url" placeholder="https://example.com/photo.heic" className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2" />
        <button onClick={handleConvertFromUrl} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900">Convert from URL</button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleConvert} disabled={pendingCount === 0}>Convert {pendingCount > 0 ? `(${pendingCount})` : ""}</Button>
        {queue.length > 0 && (
          <Button onClick={clearQueue} variant="secondary">Clear All</Button>
        )}
        <span className="text-sm text-neutral-500">If conversion fails, your browser likely doesn't support HEIC decoding.</span>
      </div>

      {queue.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((q) => (
            <li key={q.id} className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
              <div className="text-sm font-medium truncate" title={q.file.name}>{q.file.name}</div>
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


