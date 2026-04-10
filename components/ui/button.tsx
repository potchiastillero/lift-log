import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[linear-gradient(135deg,#83c3ff_0%,#2e86ff_100%)] text-slate-950 shadow-[0_18px_50px_rgba(46,134,255,0.28)] hover:-translate-y-0.5",
        secondary:
          "border-line-strong bg-white/5 text-foreground hover:border-white/20 hover:bg-white/8",
        ghost: "border-transparent bg-transparent text-muted-strong hover:bg-white/5 hover:text-foreground"
      },
      size: {
        default: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        sm: "h-9 px-4 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
