type FAQItem = {
  question: string;
  answer: string;
};

export function FAQList({ items }: { items: FAQItem[] }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <details key={item.question} className="surface-panel hairline rounded-[30px] px-5 py-5 group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-serif text-2xl leading-tight tracking-[-0.04em] marker:hidden">
            <span>{item.question}</span>
            <span className="mt-1 text-base text-muted transition group-open:rotate-45">+</span>
          </summary>
          <p className="pt-4 text-sm leading-7 text-muted sm:text-base">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
