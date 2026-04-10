import type { Route } from "next";
import Link from "next/link";

type InternalLink = {
  label: string;
  href: string;
  description: string;
};

export function InternalLinksPanel({
  title,
  links
}: {
  title: string;
  links: InternalLink[];
}) {
  return (
    <div className="surface-panel hairline rounded-[32px] p-5 sm:p-6">
      <div className="text-[0.68rem] uppercase tracking-[0.24em] text-brand-deep">Keep reading</div>
      <h3 className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em] text-foreground">{title}</h3>
      <div className="mt-6 space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href as Route}
            className="block rounded-[24px] border border-black/[0.08] bg-white/[0.72] px-4 py-4 transition-colors hover:bg-white"
          >
            <strong className="block text-base font-medium text-foreground">{link.label}</strong>
            <p className="mt-2 text-sm leading-7 text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
