
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primär knapp: Solid med accentfärg
        default: "bg-accent text-white hover:bg-accent/90",
        
        // Destruktiv knapp: Behåller röd färg för varningar
        destructive:
          "bg-status-red text-white hover:bg-status-red/90",
          
        // Outline (Ghost) knapp: Kantlinje i accentfärg
        outline:
          "border border-accent bg-transparent text-accent hover:bg-accent/15",
          
        // Sekundär knapp: Subtil, mindre framträdande
        secondary:
          "bg-component-background text-text-secondary hover:bg-border",
          
        // Ghost-knapp: För ikoner och minimal interaktion
        ghost: "hover:bg-accent/15 text-text-secondary hover:text-text-primary",
        
        // Länk-knapp: Ser ut som en textlänk
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
