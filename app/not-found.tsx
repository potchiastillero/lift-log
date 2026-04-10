import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="app-shell flex min-h-screen flex-col items-center justify-center py-16 text-center">
      <div className="panel w-full max-w-xl rounded-[36px] p-10">
        <p className="text-xs uppercase tracking-[0.34em] text-accent">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground">Signal not found</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          The route you tried to open does not exist inside the current system map.
        </p>
        <Link href="/" className="mt-8 inline-flex">
          <Button>Return home</Button>
        </Link>
      </div>
    </div>
  );
}
