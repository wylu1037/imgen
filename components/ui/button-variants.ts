import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-cta hover:bg-primary-pressed",
        dark:
          "bg-ink-deep text-white hover:bg-charcoal",
        destructive:
          "bg-destructive text-destructive-foreground shadow-subtle hover:bg-destructive/90",
        outline:
          "border border-hairline-strong bg-transparent text-ink hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-subtle hover:bg-accent",
        ghost:
          "rounded-sm text-ink hover:bg-secondary",
        link:
          "text-link-blue underline-offset-4 hover:underline",
        onDark:
          "bg-white text-ink hover:bg-tint-gray",
      },
      size: {
        default: "h-10 px-[18px] py-2.5",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>
