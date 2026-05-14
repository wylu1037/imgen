import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border text-card-foreground",
  {
    variants: {
      tone: {
        default: "border-border bg-card shadow-card",
        flat: "border-border bg-card",
        peach: "border-transparent bg-tint-peach text-charcoal",
        rose: "border-transparent bg-tint-rose text-charcoal",
        mint: "border-transparent bg-tint-mint text-charcoal",
        lavender: "border-transparent bg-tint-lavender text-charcoal",
        sky: "border-transparent bg-tint-sky text-charcoal",
        yellow: "border-transparent bg-tint-yellow text-charcoal",
        yellowBold: "border-transparent bg-tint-yellow-bold text-charcoal",
        cream: "border-transparent bg-tint-cream text-charcoal",
        navy: "border-transparent bg-brand-navy text-white shadow-mockup",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ tone, className }))}
      {...props}
    />
  ),
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[22px] font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm leading-relaxed text-slate", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
