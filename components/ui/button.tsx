"use client"

import * as React from "react"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"
import {
  buttonVariants,
  type ButtonVariantsProps,
} from "@/components/ui/button-variants"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantsProps {
  asChild?: boolean
  render?: useRender.RenderProp<Record<string, never>>
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      render,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const resolvedRender =
      render ??
      (asChild && React.isValidElement(children)
        ? (children as React.ReactElement)
        : undefined)

    return useRender({
      render: resolvedRender,
      defaultTagName: "button",
      ref,
      props: {
        ...props,
        ...(resolvedRender ? {} : { type: type ?? "button", children }),
        className: cn(buttonVariants({ variant, size, className })),
      },
    })
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
