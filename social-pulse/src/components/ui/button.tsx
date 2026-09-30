import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-none font-bold uppercase tracking-wide transition-all brut-border focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-black brut-shadow hover:brut-shadow-lg hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111]",
        black: "bg-black text-white brut-shadow hover:brut-shadow-lg hover:translate-x-[-2px] hover:translate-y-[-2px]",
        purple: "bg-purple text-black brut-shadow hover:brut-shadow-lg",
        pink: "bg-pink text-black brut-shadow",
        blue: "bg-blue text-black brut-shadow",
        outline: "bg-white text-black brut-shadow hover:bg-black hover:text-white",
        ghost: "bg-transparent border-transparent shadow-none hover:bg-primary hover:border-black",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
