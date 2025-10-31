"use client";

import React from "react";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  showCharCount?: boolean;
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  maxLength,
  className = "",
  showCharCount = false,
}: TextAreaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        {showCharCount && maxLength && (
          <div className="text-sm text-neutral-500">
            {value.length}/{maxLength} characters
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
