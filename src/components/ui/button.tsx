
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 font-semibold",
        destructive:
          "bg-destructive text-white shadow-md hover:bg-destructive/90 font-semibold",
        outline:
          "border-2 border-input bg-background shadow-md hover:bg-accent hover:text-accent-foreground font-medium",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 font-semibold",
        ghost: "hover:bg-accent hover:text-accent-foreground font-medium",
        link: "text-primary font-semibold underline-offset-4 hover:underline",
        // Enhanced variants with better contrast
        primary: "bg-[#9555e0] text-white shadow-md hover:bg-[#8644d4] font-bold",
        accent: "bg-[#ff6b35] text-white shadow-md hover:bg-[#f25e28] font-bold",
        soft: "bg-muted text-foreground shadow-md hover:bg-muted/80 font-medium",
        outlined: "border-2 border-[#9555e0] text-[#9555e0] bg-white dark:bg-black/20 shadow-md hover:bg-[#9555e0]/10 font-semibold",
        gallery: "bg-[#34a0a4] text-white shadow-md hover:bg-[#2a8a8e] font-bold border-2 border-[#34a0a4]",
        feed: "bg-[#ff9e00] text-white shadow-md hover:bg-[#f09600] font-bold border-2 border-[#ff9e00]",
      },
      size: {
        default: "h-10 px-5 py-2 text-base",
        sm: "h-9 rounded-md px-4 py-2 text-sm",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        xl: "h-12 rounded-md px-10 text-lg font-bold",
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
