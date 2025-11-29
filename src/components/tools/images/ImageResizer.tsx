"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileUpload,
  NumberInput,
  Select,
  RangeSlider,
  Button,
  Checkbox,
} from "../../shared";

type QueuedFile = {
  id: string;
  file: File;
  error?: string;
  resultUrl?: string;
  resultName?: string;
  originalWidth?: number;
  originalHeight?: number;
  newWidth?: number;
  newHeight?: number;
};

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

type ResizeMode = "exact" | "maintain-aspect" | "fit-to-dimensions";

function getImageDimensions(
  file: File,
  t: any
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error(t("errors.loadFailed")));
    img.src = URL.createObjectURL(file);
  });
}

function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode,
  quality: number = 0.9,
  t: any
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      let { width, height } = calculateDimensions(
        img.width,
        img.height,
        targetWidth,
        targetHeight,
        mode
      );

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(t("errors.resizeFailed")));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error(t("errors.loadFailed")));
    img.src = URL.createObjectURL(file);
  });
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode
): { width: number; height: number } {
  switch (mode) {
    case "exact":
      return { width: targetWidth, height: targetHeight };

    case "maintain-aspect":
      const aspectRatio = originalWidth / originalHeight;
      if (targetWidth / targetHeight > aspectRatio) {
        return { width: targetHeight * aspectRatio, height: targetHeight };
      } else {
        return { width: targetWidth, height: targetWidth / aspectRatio };
      }

    case "fit-to-dimensions":
      const scale = Math.min(
        targetWidth / originalWidth,
        targetHeight / originalHeight
      );
      return {
        width: originalWidth * scale,
        height: originalHeight * scale,
      };

    default:
      return { width: targetWidth, height: targetHeight };
  }
}

export default function ImageResizer() {
  const t = useTranslations("imageResizer");
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("maintain-aspect");
  const [quality, setQuality] = useState(0.9);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const pendingCount = useMemo(
    () => queue.filter((q) => !q.resultUrl && !q.error).length,
    [queue]
  );

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      setQueue((prev) => {
        const remainingSlots = Math.max(0, MAX_FILES - prev.length);
        const toAdd = arr.slice(0, remainingSlots).map((file, idx) => {
          const id = `${Date.now()}-${idx}-${file.name}`;
          if (!file.type.startsWith("image/")) {
            return {
              id,
              file,
              error: t("errors.onlyImages"),
            } as QueuedFile;
          }
          if (file.size > MAX_SIZE_BYTES) {
            return { id, file, error: t("errors.maxSize") } as QueuedFile;
          }
          return { id, file } as QueuedFile;
        });
        return [...prev, ...toAdd];
      });

      // Load image dimensions for new files
      for (const file of arr.slice(0, Math.max(0, MAX_FILES - queue.length))) {
        try {
          const dimensions = await getImageDimensions(file, t);
          setQueue((prev) =>
            prev.map((item) =>
              item.file === file
                ? {
                    ...item,
                    originalWidth: dimensions.width,
                    originalHeight: dimensions.height,
                  }
                : item
            )
          );
        } catch (err) {
          setQueue((prev) =>
            prev.map((item) =>
              item.file === file
                ? { ...item, error: t("errors.loadFailed") }
                : item
            )
          );
        }
      }
    },
    [queue, t]
  );

  const handleResize = useCallback(async () => {
    const updatedQueue = [...queue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.error || item.resultUrl) continue;

      try {
        const resizedBlob = await resizeImage(
          item.file,
          targetWidth,
          targetHeight,
          resizeMode,
          quality,
          t
        );

        const dimensions = calculateDimensions(
          item.originalWidth || 0,
          item.originalHeight || 0,
          targetWidth,
          targetHeight,
          resizeMode
        );

        const fname = item.file.name.replace(
          /\.[^/.]+$/,
          `_${dimensions.width}x${dimensions.height}.${item.file.name
            .split(".")
            .pop()}`
        );
        const url = URL.createObjectURL(resizedBlob);
        updatedQueue[i] = {
          ...item,
          resultUrl: url,
          resultName: fname,
          newWidth: dimensions.width,
          newHeight: dimensions.height,
        };
      } catch (err) {
        updatedQueue[i] = { ...item, error: t("errors.resizeFailed") };
      }
    }

    setQueue(updatedQueue);
  }, [queue, targetWidth, targetHeight, resizeMode, quality, t]);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.resultUrl) {
        URL.revokeObjectURL(item.resultUrl);
      }
    });
    setQueue([]);
  }, [queue]);

  const handleWidthChange = (value: number) => {
    setTargetWidth(value);
    if (maintainAspectRatio && queue.length > 0) {
      const firstImage = queue.find((q) => q.originalWidth && q.originalHeight);
      if (firstImage?.originalWidth && firstImage?.originalHeight) {
        const aspectRatio =
          firstImage.originalHeight / firstImage.originalWidth;
        setTargetHeight(Math.round(value * aspectRatio));
      }
    }
  };

  const handleHeightChange = (value: number) => {
    setTargetHeight(value);
    if (maintainAspectRatio && queue.length > 0) {
      const firstImage = queue.find((q) => q.originalWidth && q.originalHeight);
      if (firstImage?.originalWidth && firstImage?.originalHeight) {
        const aspectRatio =
          firstImage.originalWidth / firstImage.originalHeight;
        setTargetWidth(Math.round(value * aspectRatio));
      }
    }
  };

  const resizeModeOptions = [
    { value: "maintain-aspect", label: t("resizeModes.maintainAspect") },
    { value: "exact", label: t("resizeModes.exact") },
    { value: "fit-to-dimensions", label: t("resizeModes.fitToDimensions") },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t("description")}
        </p>
      </div>

      {/* File Upload */}
      <FileUpload
        accept="image/*"
        multiple
        maxFiles={MAX_FILES}
        maxSizeBytes={MAX_SIZE_BYTES}
        onFilesSelected={addFiles}
      >
        <div className="text-sm">{t("dropFiles")}</div>
        <div className="text-xs text-neutral-500">{t("fileLimits")}</div>
      </FileUpload>

      {/* Resize Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("resizeSettings")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput
            label={t("targetWidth")}
            value={targetWidth}
            onChange={handleWidthChange}
            min={1}
            max={4000}
          />

          <NumberInput
            label={t("targetHeight")}
            value={targetHeight}
            onChange={handleHeightChange}
            min={1}
            max={4000}
          />
        </div>

        <Select
          label={t("resizeMode")}
          value={resizeMode}
          onChange={(value) => setResizeMode(value as ResizeMode)}
          options={resizeModeOptions}
        />

        <RangeSlider
          label={t("quality")}
          value={quality}
          onChange={setQuality}
          min={0.1}
          max={1}
          step={0.1}
          showValue={true}
          unit="%"
        />

        <Checkbox
          label={t("maintainAspectRatio")}
          checked={maintainAspectRatio}
          onChange={setMaintainAspectRatio}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleResize} disabled={pendingCount === 0}>
          {t("resize")} {pendingCount > 0 ? `(${pendingCount})` : ""}
        </Button>
        {queue.length > 0 && (
          <Button onClick={clearQueue} variant="secondary">
            {t("clearAll")}
          </Button>
        )}
        <span className="text-sm text-neutral-500">{t("filesWillAppear")}</span>
      </div>

      {/* Results */}
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

              {q.originalWidth && q.originalHeight && (
                <div className="text-xs text-neutral-500">
                  {t("original")}: {q.originalWidth} × {q.originalHeight}px
                </div>
              )}

              {q.error ? (
                <div className="text-xs text-red-600">{q.error}</div>
              ) : q.resultUrl ? (
                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">
                    {t("resized")}: {q.newWidth} × {q.newHeight}px
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <img
                      src={q.resultUrl}
                      alt={q.resultName || t("resized")}
                      className="h-8 w-8 object-cover rounded"
                    />
                    <a
                      href={q.resultUrl}
                      download={q.resultName || "resized.jpg"}
                      className="text-sm underline"
                    >
                      {t("download")}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500">
                  {t("readyToResize")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
