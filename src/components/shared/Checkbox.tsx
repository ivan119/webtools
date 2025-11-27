"use client";

import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  description?: string;
}

export function Checkbox({
  label,
  checked,
  onChange,
  className = "",
  description,
}: CheckboxProps) {
  return (
    <label className={`flex items-start gap-2 text-sm ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-neutral-300 dark:border-neutral-700"
      />
      <div>
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </div>
        )}
      </div>
    </label>
  );
}
