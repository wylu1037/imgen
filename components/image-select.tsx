"use client"

import { Check, ChevronDown } from "lucide-react"
import { Select } from "@base-ui/react/select"

import { cn } from "@/lib/utils"

type ImageOption = {
  label: string
  value: string
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
          onValueChange(nextValue)
        }
      }}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3.5 py-2 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring/20 data-disabled:cursor-not-allowed data-disabled:opacity-50"
      >
        <Select.Value>{selected?.label ?? value}</Select.Value>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} className="z-50 outline-none">
          <Select.Popup className="min-w-[var(--anchor-width)] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-card outline-none">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "grid cursor-default select-none grid-cols-[1rem_1fr] items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                )}
              >
                <Select.ItemIndicator>
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
