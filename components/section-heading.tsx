type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={[
        "max-w-3xl space-y-5",
        centered ? "mx-auto text-center" : "text-left"
      ].join(" ")}
    >
      <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/70 px-4 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-brand-deep shadow-[0_10px_30px_rgba(47,39,29,0.05)]">
        {eyebrow}
      </span>
      <div className="space-y-4">
        <h2 className="font-serif text-4xl leading-none tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{description}</p>
      </div>
    </div>
  );
}
