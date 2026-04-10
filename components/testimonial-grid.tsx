type Testimonial = {
  quote: string;
  name: string;
  context: string;
};

export function TestimonialGrid({ items }: { items: Testimonial[] }) {
  return (
    <div className="testimonial-grid">
      {items.map((item) => (
        <article className="quote-card" key={item.name}>
          <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
          <strong style={{ fontFamily: "var(--font-display)" }}>{item.name}</strong>
          <p className="muted">{item.context}</p>
        </article>
      ))}
    </div>
  );
}
