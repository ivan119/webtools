"use client";

import React from "react";

interface RangeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showValue?: boolean;
  unit?: string;
}

export function RangeSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
  showValue = true,
  unit = "",
}: RangeSliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        {showValue && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {value}
            {unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
