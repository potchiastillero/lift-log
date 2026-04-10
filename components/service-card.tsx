import Link from "next/link";
import type { ServicePage } from "@/lib/site-content";

export function ServiceCard({ service }: { service: ServicePage }) {
  return (
    <article className="service-card">
      <span className="meta-label">{service.category}</span>
      <strong>{service.title}</strong>
      <p className="muted">{service.summary}</p>
      <div className="pill-list" style={{ marginBottom: "1rem" }}>
        {service.highlights.slice(0, 2).map((item) => (
          <span className="pill" key={item}>
            {item}
          </span>
        ))}
      </div>
      <Link href={`/${service.slug}`} className="button-ghost">
        View project
      </Link>
    </article>
  );
}
