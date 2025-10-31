"use client";

import React from "react";

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  className = "",
}: SelectProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
