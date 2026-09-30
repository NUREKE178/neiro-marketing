import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-black",
        black: "bg-black text-white",
        purple: "bg-purple text-black",
        pink: "bg-pink text-black",
        blue: "bg-blue text-black",
        white: "bg-white text-black",
        demo: "bg-black text-primary border-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
