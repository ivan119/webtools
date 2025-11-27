"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { FileUpload, Button, Checkbox } from "../../shared";

type QueuedFile = {
  id: string;
  file: File;
  error?: string;
  resultUrl?: string;
  resultName?: string;
};

const MAX_FILES = 20;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function arrayBufferToIcoPngOnly(buf: ArrayBuffer): Blob {
  const view = new DataView(new ArrayBuffer(6 + 16));
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  const png = new Uint8Array(buf);
  view.setUint8(6, 0);
  view.setUint8(7, 0);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, png.byteLength, true);
  view.setUint32(18, 6 + 16, true);

  const header = new Uint8Array(view.buffer);
  const ico = new Uint8Array(header.byteLength + png.byteLength);
  ico.set(header, 0);
  ico.set(png, header.byteLength);
  return new Blob([ico], { type: "image/x-icon" });
}

async function fetchUrlAsFile(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch URL");
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("image/png")) {
    throw new Error("URL must point to a PNG image");
  }
  const blob = await res.blob();
  if (blob.size > MAX_SIZE_BYTES) {
    throw new Error("Image exceeds 5MB limit");
  }
  return new File([blob], "from-url.png", { type: "image/png" });
}

export default function PngToIcoConverter() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [agreeRecent, setAgreeRecent] = useState<boolean>(false);
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
        if (file.type !== "image/png") {
          return {
            id,
            file,
            error: "Only PNG files are supported",
          } as QueuedFile;
        }
        if (file.size > MAX_SIZE_BYTES) {
          return { id, file, error: "Max size is 5MB" } as QueuedFile;
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
        const ab = await item.file.arrayBuffer();
        const icoBlob = arrayBufferToIcoPngOnly(ab);
        const fname = item.file.name.replace(/\.png$/i, ".ico");
        const url = URL.createObjectURL(icoBlob);
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
      if (item.resultUrl) {
        URL.revokeObjectURL(item.resultUrl);
      }
    });
    setQueue([]);
  }, [queue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">PNG to ICO Converter</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          A free PNG to ICO converter for desktop icons, app icons, and
          favicons.
        </p>
      </div>

      <FileUpload
        accept="image/png"
        multiple
        maxFiles={MAX_FILES}
        maxSizeBytes={MAX_SIZE_BYTES}
        onFilesSelected={addFiles}
      >
        <div className="text-sm">
          Drop your .png files here, or click to select them manually!
        </div>
        <div className="text-xs text-neutral-500">
          Up to 20 PNG files, max 5MB each.
        </div>
      </FileUpload>

      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input
          ref={urlInputRef}
          type="url"
          placeholder="https://example.com/image.png"
          className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
        />
        <button
          onClick={handleConvertFromUrl}
          className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          Convert from URL
        </button>
      </div>

      <Checkbox
        label="I agree to display the icon in Recently Converted"
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
          Your ICO files will appear here, once you convert them.
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {queue.map((q) => (
          <li
            key={q.id}
            className="rounded-md border border-neutral-200 dark:border-neutral-800 p-3 space-y-2"
          >
            <div className="text-sm font-medium truncate" title={q.file.name}>
              {q.file.name}
            </div>
            {q.error ? (
              <div className="text-xs text-red-600">{q.error}</div>
            ) : q.resultUrl ? (
              <div className="flex items-center justify-between gap-2">
                <img
                  src={q.resultUrl}
                  alt={q.resultName || "icon"}
                  className="h-8 w-8"
                />
                <a
                  href={q.resultUrl}
                  download={q.resultName || "icon.ico"}
                  className="text-sm underline"
                >
                  Download ICO
                </a>
              </div>
            ) : (
              <div className="text-xs text-neutral-500">Ready to convert</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
