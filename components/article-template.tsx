import type { Route } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { FAQList } from "@/components/faq-list";
import { InternalLinksPanel } from "@/components/internal-links-panel";
import { RichText } from "@/components/rich-text";
import { SchemaScript } from "@/components/schema-script";
import type { ArticlePage } from "@/lib/site-content";
import { buildArticleSchema, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo";

export function ArticleTemplate({ article }: { article: ArticlePage }) {
  return (
    <>
      <SchemaScript data={buildBreadcrumbSchema(article)} />
      <SchemaScript data={buildArticleSchema(article)} />
      <SchemaScript data={buildFaqSchema(article)} />

      <section className="px-3 pb-8 pt-10 sm:px-4 sm:pb-10 sm:pt-14">
        <div className="section-shell">
          <div className="surface-panel hairline rounded-[40px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="flex flex-wrap items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-brand-deep">
              <span className="rounded-full border border-black/[0.08] bg-white/[0.72] px-4 py-1.5">Article</span>
              <span>{article.readTime} min read</span>
              <span>{article.lastUpdated}</span>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div className="space-y-5">
                <h1 className="max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.07em] text-balance text-foreground sm:text-6xl lg:text-[5rem]">
                  {article.title}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">{article.summary}</p>
              </div>

              <div className="rounded-[32px] border border-black/[0.08] bg-white/[0.72] p-5 sm:p-6">
                <div className="text-[0.68rem] uppercase tracking-[0.24em] text-brand-deep">Why this matters</div>
                <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                  Patients often search for answers before they ever book. A strong article should feel clear,
                  reassuring, and practical enough to build trust while guiding the next step.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {article.keywords.slice(0, 3).map((item) => (
                    <span key={item} className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs text-muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-black/[0.08] pt-6">
              <Link
                href={article.cta.href as Route}
                className="button-primary-brand inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
              >
                {article.cta.label}
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/[0.08] bg-white px-5 text-sm font-medium text-foreground transition duration-200 hover:-translate-y-0.5"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-4 sm:py-14">
        <div className="section-shell grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <RichText blocks={article.content} />

          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="surface-panel hairline rounded-[32px] p-5 sm:p-6">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-brand-deep">Article details</div>
              <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
                <div>
                  <div className="text-foreground">Read time</div>
                  <div>{article.readTime} minutes</div>
                </div>
                <div>
                  <div className="text-foreground">Last updated</div>
                  <div>{article.lastUpdated}</div>
                </div>
                <div>
                  <div className="text-foreground">Intent</div>
                  <div>{article.primaryIntent}</div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-brand p-5 text-white sm:p-6">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-white/[0.58]">Next step</div>
              <h2 className="mt-3 font-serif text-3xl leading-none tracking-[-0.04em]">{article.cta.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/[0.72]">{article.cta.description}</p>
              <Link
                href={article.cta.href as Route}
                className="button-secondary-light mt-5 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium"
              >
                {article.cta.label}
              </Link>
            </div>

            <InternalLinksPanel title="Related reading" links={article.relatedLinks} />
          </div>
        </div>
      </section>

      <section className="px-3 py-14 sm:px-4 sm:py-20">
        <div className="section-shell">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/70 px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.28em] text-brand-deep">
              FAQ
            </span>
            <h2 className="font-serif text-4xl leading-none tracking-[-0.05em] text-foreground sm:text-5xl">
              Clear answers help an article feel useful, not just informative.
            </h2>
            <p className="text-base leading-8 text-muted sm:text-lg">
              These FAQs are built to support decision-making for readers who are comparing treatment options, costs,
              expectations, and next steps.
            </p>
          </div>
          <div className="mt-10">
            <FAQList items={article.faqs} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to turn research into a next step?"
        description="A strong article should build enough confidence for a patient to ask a better question, request a consultation, or continue exploring with clarity."
        primaryCta={article.cta}
        secondaryCta={{ href: "/blog", label: "View more articles" }}
      />
    </>
  );
}
