import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-cta hover:bg-primary-pressed",
        dark: "bg-ink-deep text-white hover:bg-charcoal",
        destructive:
          "bg-destructive text-destructive-foreground shadow-subtle hover:bg-destructive/90",
        outline:
          "border border-hairline-strong bg-transparent text-ink hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-subtle hover:bg-accent",
        ghost: "rounded-sm text-ink hover:bg-secondary",
        link: "text-link-blue underline-offset-4 hover:underline",
        onDark: "bg-white text-ink hover:bg-tint-gray",
      },
      size: {
        default: "h-10 px-[18px] py-2.5 has-[>svg]:px-4",
        sm: "h-9 px-3 text-[13px] has-[>svg]:px-2.5",
        lg: "h-12 px-6 text-[15px] has-[>svg]:px-5",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    ref?: React.RefObject<HTMLButtonElement | null>;
  };

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
