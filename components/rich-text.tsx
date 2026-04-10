import type { ContentBlock } from "@/lib/site-content";

export function RichText({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <article className="surface-panel hairline rounded-[36px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        {blocks.map((block, index) => {
          if (block.type === "heading") {
            return (
              <h2
                key={`${block.type}-${index}`}
                className="mt-12 font-serif text-3xl leading-none tracking-[-0.05em] text-foreground first:mt-0 sm:text-4xl"
              >
                {block.text}
              </h2>
            );
          }

          if (block.type === "subheading") {
            return (
              <h3
                key={`${block.type}-${index}`}
                className="mt-8 font-serif text-2xl leading-none tracking-[-0.04em] text-foreground sm:text-3xl"
              >
                {block.text}
              </h3>
            );
          }

          if (block.type === "list") {
            return (
              <ul key={`${block.type}-${index}`} className="mt-6 space-y-3 pl-0">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-8 text-muted">
                    <span className="mt-[0.9rem] h-1.5 w-1.5 rounded-full bg-brand-deep" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={`${block.type}-${index}`} className="mt-6 text-base leading-8 text-muted first:mt-0 sm:text-lg">
              {block.text}
            </p>
          );
        })}
      </div>
    </article>
  );
}
