"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";

  const variantClasses = {
    primary:
      "bg-black text-white hover:opacity-90 dark:bg-white dark:text-black",
    secondary:
      "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
