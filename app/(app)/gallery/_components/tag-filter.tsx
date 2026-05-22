"use client";

import { cn } from "@/lib/utils";

type TagOption = {
  value: string;
  label: string;
  count: number;
};

type TagFilterProps = {
  options: TagOption[];
  selected: string;
  onSelect: (value: string) => void;
};

export function TagFilter({ options, selected, onSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isActive = option.value === selected;
        return (
          <div key={option.value} className="relative">
            <button
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "inline-flex h-7 items-center rounded-md border px-3 transition-colors duration-150 ease-out",
                "focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
                isActive
                  ? "border-primary/30 bg-tint-lavender text-brand-purple-800"
                  : "border-hairline-soft bg-card text-charcoal hover:border-primary/30 hover:text-primary",
              )}
            >
              <span className="max-w-40 truncate text-sm leading-none">
                {option.label}
              </span>
            </button>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-2 -right-2 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full border px-1 text-[10px] leading-none tabular-nums shadow-subtle",
                isActive
                  ? "border-primary/30 bg-brand-purple-800 text-white"
                  : "border-hairline-soft bg-card text-charcoal",
              )}
            >
              {option.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
