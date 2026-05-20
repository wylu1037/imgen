"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "@base-ui/react/select";

import { cn } from "@/lib/utils";
import type { OptionItem } from "@/lib/chat/constants";

type ParamChipProps = {
  ariaLabel: string;
  value: string;
  onValueChange: (next: string) => void;
  options: OptionItem[];
  icon?: React.ReactNode;
  disabled?: boolean;
};

export function ParamChip({
  ariaLabel,
  value,
  onValueChange,
  options,
  icon,
  disabled,
}: ParamChipProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md border border-hairline-strong bg-card px-2.5 text-sm! font-medium text-charcoal",
          "transition-colors duration-150 ease-out",
          "focus:border-primary focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        )}
      >
        {icon ? <span className="text-stone">{icon}</span> : null}
        <Select.Value>
          <span className="truncate">{selected?.label ?? value}</span>
        </Select.Value>
        <Select.Icon>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} className="z-50 outline-none">
          <Select.Popup className="min-w-(--anchor-width) rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-modal outline-none">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "grid cursor-default grid-cols-[0.875rem_1fr_auto] items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none",
                  "data-highlighted:bg-secondary data-highlighted:text-ink",
                )}
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center text-primary">
                  <Select.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                </span>
                <Select.ItemText>
                  <span className="font-medium text-ink">{option.label}</span>
                </Select.ItemText>
                {option.meta ? (
                  <span className="text-[11px] tracking-tight text-steel">
                    {option.meta}
                  </span>
                ) : null}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
