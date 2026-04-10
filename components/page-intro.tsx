type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="px-3 pb-8 pt-10 sm:px-4 sm:pb-10 sm:pt-14">
      <div className="section-shell">
        <div className="surface-panel hairline rounded-[40px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/80 px-4 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-brand-deep shadow-[0_10px_30px_rgba(47,39,29,0.05)]">
            {eyebrow}
          </span>
          <div className="mt-7 max-w-3xl space-y-5">
            <h1 className="font-serif text-5xl leading-[0.92] tracking-[-0.07em] text-balance sm:text-6xl lg:text-[4.9rem]">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
