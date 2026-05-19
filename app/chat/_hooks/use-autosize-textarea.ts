"use client"

import * as React from "react"

const MAX_HEIGHT = 192

export function useAutosizeTextarea(value: string) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  return ref
}
