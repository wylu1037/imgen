"use client"

import { Check, ChevronDown } from "lucide-react"
import { Select } from "@base-ui/react/select"

import { cn } from "@/lib/utils"

type ImageOption = {
  label: string
  value: string
  meta?: string
}

type ImageSelectProps = {
  value: string
  onValueChange: (value: string) => void
  options: ImageOption[]
  ariaLabel: string
}

export function ImageSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
}: ImageSelectProps) {
  const selected = options.find((option) => option.value === value)

  return (
    <Select.Root
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-hairline-strong bg-card px-4 text-left text-sm text-ink transition-all duration-150 ease-out focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15 data-disabled:cursor-not-allowed data-disabled:opacity-50"
      >
        <Select.Value>
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-sm font-medium text-ink">
              {selected?.label ?? value}
            </span>
            {selected?.meta ? (
              <span className="shrink-0 text-[11px] tracking-tight text-steel">
                {selected.meta}
              </span>
            ) : null}
          </span>
        </Select.Value>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-stone" />
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
                  "grid cursor-default select-none grid-cols-[0.875rem_1fr_auto] items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none",
                  "data-highlighted:bg-secondary data-highlighted:text-ink",
                )}
              >
                <span className="flex h-3.5 w-3.5 items-center justify-center text-primary">
                  <Select.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </Select.ItemIndicator>
                </span>
                <Select.ItemText>
                  <span className="font-medium text-ink">
                    {option.label}
                  </span>
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
