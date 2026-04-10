import type { Route } from "next";
import Link from "next/link";

type CtaLink = {
  href: string;
  label: string;
};

type CtaBandProps = {
  title: string;
  description: string;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
};

export function CtaBand({ title, description, primaryCta, secondaryCta }: CtaBandProps) {
  return (
    <section className="px-3 py-14 sm:px-4 sm:py-20">
      <div className="section-shell">
        <div className="rounded-[40px] bg-brand px-6 py-8 text-white shadow-[0_28px_80px_rgba(53,129,240,0.22)] sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-3xl">
            <span className="text-[0.68rem] uppercase tracking-[0.28em] text-white/[0.58]">Next step</span>
            <h2 className="mt-5 font-serif text-4xl leading-none tracking-[-0.06em] text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/[0.72] sm:text-base">{description}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCta.href as Route}
              className="button-secondary-light inline-flex min-h-14 items-center justify-center rounded-full px-6 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
            >
              {primaryCta.label}
            </Link>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href as Route}
                className="button-secondary-on-brand inline-flex min-h-14 items-center justify-center rounded-full px-6 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
