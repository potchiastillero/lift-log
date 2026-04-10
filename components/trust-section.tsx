import { trustSignals } from "@/data/site";
import { SectionHeading } from "@/components/section-heading";

export function TrustSection() {
  return (
    <section className="section-band">
      <div className="container">
        <SectionHeading
          eyebrow="What builds trust"
          title="A first website should feel clear, thoughtful, and easy to move through."
          description="These cards reinforce the qualities that make a personal site feel intentional instead of improvised."
        />
        <div className="trust-grid">
          {trustSignals.map((item) => (
            <div className="trust-card" key={item.title}>
              <span className="meta-label">{item.kicker}</span>
              <strong>{item.title}</strong>
              <p className="muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
