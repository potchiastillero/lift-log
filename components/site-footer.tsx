import Link from "next/link";
import { contactDetails, footerLinks, officeHours, siteSettings } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="pb-8 pt-16 sm:pt-24">
      <div className="section-shell">
        <div className="surface-panel hairline rounded-[36px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr_0.9fr]">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/70 px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.28em] text-brand-deep">
                Alora Dental Clinic
              </span>
              <div className="space-y-3">
                <h2 className="font-serif text-3xl leading-none tracking-[-0.05em] sm:text-4xl">
                  Premium dental care with a calmer, more thoughtful patient experience.
                </h2>
                <p className="max-w-md text-sm leading-7 text-muted sm:text-base">
                  A refined dental brand for patients who want expert care, clean communication, and an environment that feels reassuring from the first visit.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">Location</h3>
              <div className="space-y-2 text-sm leading-7 sm:text-base">
                <p>{contactDetails.address}</p>
                <p className="text-muted">{contactDetails.bookingNote}</p>
                <a href="tel:09558276875" className="text-brand-deep transition-colors hover:text-foreground">
                  {contactDetails.phone}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">Hours</h3>
              <div className="space-y-2 text-sm leading-7 sm:text-base">
                {officeHours.map((item) => (
                  <div key={item.day}>
                    <div>{item.day}</div>
                    <div className="text-muted">{item.hours}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {footerLinks.map((group) => (
                <div key={group.title} className="space-y-3">
                  <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">{group.title}</h3>
                  <div className="space-y-2 text-sm leading-7 sm:text-base">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="block transition-colors hover:text-brand-deep">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-black/[0.08] pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>{siteSettings.name} | Quezon City</p>
            <p>Designed for clarity, comfort, and confident booking.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
