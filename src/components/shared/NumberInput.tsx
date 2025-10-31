"use client";

import React from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max = 10000,
  step = 1,
  className = "",
  disabled = false,
}: NumberInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
