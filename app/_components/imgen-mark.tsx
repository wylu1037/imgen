"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ImgenMarkProps = {
  className?: string;
};

export function ImgenMark({ className }: ImgenMarkProps) {
  const gradientId = React.useId();
  return (
    <svg
      viewBox="0 0 180 180"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        d="M38 136 L38 52 L56 52 L90 100 L124 52 L142 52 L142 136 L124 136 L124 80 L96 124 L84 124 L56 80 L56 136 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

export function ImgenMarkBadge({ className }: ImgenMarkProps) {
  return (
    <span
      aria-label="Imgen"
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink shadow-subtle",
        className,
      )}
    >
      <ImgenMark />
    </span>
  );
}
