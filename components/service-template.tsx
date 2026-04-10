import type { Route } from "next";
import { CtaBand } from "@/components/cta-band";
import { FAQList } from "@/components/faq-list";
import { InternalLinksPanel } from "@/components/internal-links-panel";
import { RichText } from "@/components/rich-text";
import { SchemaScript } from "@/components/schema-script";
import { TestimonialGrid } from "@/components/testimonial-grid";
import type { ServicePage } from "@/lib/site-content";
import { buildBreadcrumbSchema, buildFaqSchema, buildServiceSchema } from "@/lib/seo";
import Link from "next/link";

export function ServiceTemplate({ service }: { service: ServicePage }) {
  return (
    <>
      <SchemaScript data={buildBreadcrumbSchema(service)} />
      <SchemaScript data={buildServiceSchema(service)} />
      <SchemaScript data={buildFaqSchema(service)} />

      <section className="page-hero">
        <div className="container">
          <div className="page-hero__panel">
            <span className="eyebrow">{service.category}</span>
            <h1>{service.title}</h1>
            <p className="muted" style={{ maxWidth: "65ch" }}>{service.summary}</p>
            <div className="pill-list" style={{ marginTop: "1rem" }}>
              {service.highlights.map((item) => (
                <span className="pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container content-layout">
          <RichText blocks={service.content} />
          <div className="sidebar-stack">
            <div className="cta-panel">
              <span className="meta-label">Consultation CTA</span>
              <h2 style={{ fontSize: "1.7rem", lineHeight: 1, marginTop: "0.8rem" }}>{service.cta.title}</h2>
              <p className="muted">{service.cta.description}</p>
              <Link href={service.cta.href as Route} className="button-primary">
                {service.cta.label}
              </Link>
            </div>
            <InternalLinksPanel title="Supporting resources" links={service.relatedLinks} />
          </div>
        </div>
      </section>

      <section className="section-band section-band--contrast">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">What stands out</span>
            <h2>Project pages should reveal taste, clarity, and intent.</h2>
            <p>
              This reusable layout can hold collaborator quotes, outcomes, next-step ideas, or even screenshots later
              on as the project becomes more real.
            </p>
          </div>
          <TestimonialGrid items={service.testimonials} />
        </div>
      </section>

      <section className="section-band">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">More context</span>
            <h2>FAQs help explain where the idea came from and where it could go next.</h2>
            <p>
              These blocks give project pages a little more depth without forcing everything into one long wall of copy.
            </p>
          </div>
          <FAQList items={service.faqs} />
        </div>
      </section>

      <CtaBand
        title="Every project page should make the next step feel easy."
        description="That might mean reaching out, exploring another project, or reading how the thinking behind the work evolved."
        primaryCta={service.cta}
        secondaryCta={{ href: "/contact", label: "Contact page" }}
      />
    </>
  );
}
