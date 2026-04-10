import { clinicHighlights } from "@/data/site";
import { SectionHeading } from "@/components/section-heading";

export function ClinicHighlights() {
  return (
    <section className="section-band">
      <div className="container">
        <SectionHeading
          eyebrow="Site character"
          title="A flexible section for voice, values, and the kind of work you want to be known for."
          description="This module gives the homepage personality and helps the site feel assembled with intention rather than pulled from a generic starter."
        />
        <div className="highlight-grid">
          {clinicHighlights.map((item) => (
            <article className="highlight-card" key={item.title}>
              <span className="meta-label">{item.kicker}</span>
              <strong>{item.title}</strong>
              <p className="muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
