import { cn } from "@/lib/utils";

export function Badge({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted-strong",
        className
      )}
    >
      {children}
    </span>
  );
}
