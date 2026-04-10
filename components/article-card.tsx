import Link from "next/link";
import type { ArticlePage } from "@/lib/site-content";

export function ArticleCard({ article }: { article: ArticlePage }) {
  return (
    <article className="surface-panel hairline rounded-[32px] p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-brand-deep">
        <span>{article.readTime} min read</span>
        <span>{article.primaryIntent}</span>
      </div>
      <h3 className="mt-4 font-serif text-3xl leading-none tracking-[-0.05em] text-foreground">{article.title}</h3>
      <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{article.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {article.keywords.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full border border-black/[0.08] bg-white/[0.74] px-3 py-1.5 text-xs text-muted">
            {item}
          </span>
        ))}
      </div>
      <Link
        href={`/${article.slug}`}
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-black/[0.08] bg-white px-5 text-sm font-medium text-foreground transition duration-200 hover:-translate-y-0.5"
      >
        Read article
      </Link>
    </article>
  );
}
