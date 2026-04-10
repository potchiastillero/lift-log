import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-[linear-gradient(90deg,#83c3ff_0%,#2e86ff_100%)] transition-all duration-500",
          indicatorClassName
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
