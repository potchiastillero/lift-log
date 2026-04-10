import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.07]",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
