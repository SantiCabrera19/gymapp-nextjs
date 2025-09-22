import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border bg-background-tertiary px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border-primary hover:border-border-secondary",
        error: "border-status-error hover:border-status-error focus-visible:ring-status-error",
        success: "border-status-success hover:border-status-success focus-visible:ring-status-success",
      },
      size: {
        default: "h-12 px-4 text-base",
        sm: "h-10 px-3 text-sm",
        lg: "h-14 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helper?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helper, ...props }, ref) => {
    const inputVariant = error ? "error" : variant

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          className={cn(inputVariants({ variant: inputVariant, size, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-status-error">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-text-tertiary">{helper}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
