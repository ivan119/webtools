"use client";

import React, { useCallback, useRef } from "react";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
  children?: React.ReactNode;
  enablePaste?: boolean;
}

export function FileUpload({
  accept = "*/*",
  multiple = false,
  maxFiles = 1,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  onFilesSelected,
  className = "",
  children,
  enablePaste = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAccepted = useCallback(
    (file: File) => {
      if (!accept || accept === "*/*") return true;
      const tokens = accept
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      const fileType = (file.type || "").toLowerCase();
      const fileName = (file.name || "").toLowerCase();
      return tokens.some((tok) => {
        if (tok === "*/*") return true;
        if (tok.endsWith("/*")) {
          const prefix = tok.slice(0, -2);
          return fileType.startsWith(prefix + "/");
        }
        if (tok.startsWith(".")) {
          return fileName.endsWith(tok);
        }
        return fileType === tok;
      });
    },
    [accept]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.slice(0, maxFiles).filter((file) => {
        if (!isAccepted(file)) {
          return false;
        }
        if (file.size > maxSizeBytes) {
          console.warn(`File ${file.name} exceeds size limit`);
          return false;
        }
        return true;
      });
      onFilesSelected(validFiles);
    },
    [maxFiles, maxSizeBytes, onFilesSelected, isAccepted]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLLabelElement>) => {
      if (!enablePaste) return;
      const dt = e.clipboardData;
      if (!dt) return;
      const items = Array.from(dt.items || []);
      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) {
            const type = f.type || "application/octet-stream";
            const ext =
              type === "image/png"
                ? "png"
                : type === "image/jpeg"
                ? "jpg"
                : type === "image/webp"
                ? "webp"
                : type === "image/gif"
                ? "gif"
                : type === "image/bmp"
                ? "bmp"
                : "bin";
            const name =
              f.name && f.name.trim().length > 0
                ? f.name
                : `pasted-${Date.now()}.${ext}`;
            // Ensure we have a filename; reuse the Blob contents
            const withName = f.name ? f : new File([f], name, { type });
            if (isAccepted(withName)) pastedFiles.push(withName);
          }
        }
      }
      if (pastedFiles.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(pastedFiles);
      }
    },
    [handleFiles, enablePaste, isAccepted]
  );

  const handleBrowse = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={onDrop}
      onPaste={onPaste}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleBrowse}
        className="hidden"
      />
      {children || (
        <>
          <div className="text-sm">Drop, click, or paste files here!</div>
          <div className="text-xs text-neutral-500">
            {multiple ? `Up to ${maxFiles} files` : "Single file"}, max{" "}
            {(maxSizeBytes / 1024 / 1024).toFixed(0)}MB each.
          </div>
        </>
      )}
    </label>
  );
}
