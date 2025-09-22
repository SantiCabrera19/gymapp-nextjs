import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-accent-primary text-white hover:bg-accent-hover active:scale-[0.98]",
        secondary: "bg-background-tertiary text-text-primary hover:bg-white/10 border border-border-primary",
        ghost: "hover:bg-white/10 hover:text-text-primary",
        outline: "border border-border-primary bg-transparent hover:bg-white/10",
        success: "bg-status-success text-white hover:bg-status-success/90",
        warning: "bg-status-warning text-white hover:bg-status-warning/90",
        error: "bg-status-error text-white hover:bg-status-error/90",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "h-12 w-12",
        "icon-sm": "h-10 w-10",
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button'
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
