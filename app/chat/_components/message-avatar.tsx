"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const USER_AVATAR_SRC = "/avatars/user-default.svg"

export function AssistantAvatar({ className }: { className?: string }) {
  const gradientId = React.useId()
  return (
    <span
      aria-label="Imgen"
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink shadow-subtle",
        className,
      )}
    >
      <svg viewBox="0 0 180 180" className="h-full w-full" aria-hidden="true">
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
    </span>
  )
}

export function UserAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-label="You"
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-tint-lavender ring-1 ring-hairline-soft",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={USER_AVATAR_SRC}
        alt=""
        className="h-full w-full object-cover"
      />
    </span>
  )
}
