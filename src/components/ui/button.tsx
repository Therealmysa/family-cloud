
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-primary/30",
        destructive:
          "bg-destructive text-white shadow-md hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-destructive/30",
        outline:
          "border-2 border-input bg-background shadow-md hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:scale-[1.02]",
        secondary:
          "bg-secondary text-foreground shadow-md hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-secondary/30",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] font-semibold",
        link: "text-primary font-semibold underline-offset-4 hover:underline hover:text-primary/80",
        // Variants with better contrast
        primary: "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-primary/30",
        accent: "bg-accent text-white shadow-md hover:bg-accent/90 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-accent/30",
        soft: "bg-muted text-foreground shadow-md hover:bg-muted/80 hover:shadow-lg hover:scale-[1.02] font-semibold border-2 border-muted/30",
        outlined: "border-2 border-primary text-primary bg-white/90 dark:bg-black/20 shadow-md hover:bg-primary/10 hover:shadow-lg hover:scale-[1.02] font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2 text-base",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8 text-lg",
        icon: "h-10 w-10",
        xl: "h-12 rounded-md px-10 text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
