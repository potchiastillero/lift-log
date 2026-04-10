import { contactDetails, officeHours } from "@/data/site";

export function ContactPageView() {
  return (
    <div className="pb-16 pt-12 sm:pb-24 sm:pt-16">
      <section className="section-shell">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-panel hairline rounded-[36px] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            <span className="inline-flex items-center rounded-full border border-black/[0.08] bg-white/70 px-4 py-1.5 text-[0.68rem] uppercase tracking-[0.28em] text-brand-deep">
              Contact
            </span>
            <div className="mt-6 max-w-xl space-y-5">
              <h1 className="font-serif text-5xl leading-none tracking-[-0.06em] text-balance sm:text-6xl">
                Book a visit that feels calm before you even walk in.
              </h1>
              <p className="text-base leading-8 text-muted sm:text-lg">
                Reach out for a consultation, ask about treatment options, or let the clinic know what kind of care you need. The process is designed to feel simple, private, and reassuring from the first step.
              </p>
            </div>

            <form className="mt-10 grid gap-4">
              <label className="space-y-2">
                <span className="text-sm text-muted">Full name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  className="min-h-14 w-full rounded-[22px] border border-black/[0.08] bg-white/85 px-5 text-foreground outline-none transition focus:border-brand/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Phone number</span>
                <input
                  type="tel"
                  placeholder="0955-827-6875"
                  className="min-h-14 w-full rounded-[22px] border border-black/[0.08] bg-white/85 px-5 text-foreground outline-none transition focus:border-brand/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="min-h-14 w-full rounded-[22px] border border-black/[0.08] bg-white/85 px-5 text-foreground outline-none transition focus:border-brand/60"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-muted">What would you like help with?</span>
                <textarea
                  rows={5}
                  placeholder="Consultation, cosmetic treatment, implants, Invisalign, whitening, or urgent care."
                  className="w-full rounded-[22px] border border-black/[0.08] bg-white/85 px-5 py-4 text-foreground outline-none transition focus:border-brand/60"
                />
              </label>
              <button
                type="submit"
                className="button-primary-brand mt-2 inline-flex min-h-14 items-center justify-center rounded-full px-6 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
              >
                Request an Appointment
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="surface-panel hairline rounded-[36px] px-6 py-8 sm:px-8">
              <h2 className="font-serif text-3xl tracking-[-0.05em]">Clinic details</h2>
              <div className="mt-6 space-y-3 text-base leading-7">
                <p>{contactDetails.address}</p>
                <a href="tel:09558276875" className="block text-brand-deep transition-colors hover:text-foreground">
                  {contactDetails.phone}
                </a>
                <a href={`mailto:${contactDetails.email}`} className="block text-muted transition-colors hover:text-foreground">
                  {contactDetails.email}
                </a>
                <p className="text-muted">{contactDetails.bookingNote}</p>
              </div>
            </div>

            <div className="surface-panel hairline rounded-[36px] px-6 py-8 sm:px-8">
              <h2 className="font-serif text-3xl tracking-[-0.05em]">Hours</h2>
              <div className="mt-6 space-y-4">
                {officeHours.map((item) => (
                  <div key={item.day} className="flex items-start justify-between gap-4 border-b border-black/[0.08] pb-4 last:border-b-0 last:pb-0">
                    <span>{item.day}</span>
                    <span className="text-right text-muted">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[36px] bg-brand px-6 py-8 text-white sm:px-8">
              <div className="space-y-4">
                <span className="text-[0.68rem] uppercase tracking-[0.28em] text-white/60">What to expect</span>
                <h2 className="font-serif text-3xl leading-none tracking-[-0.05em]">Private scheduling. Clear planning. A calmer pace.</h2>
                <p className="text-sm leading-7 text-white/70 sm:text-base">
                  The booking flow is designed to feel simple and reassuring, especially for patients who want a more polished, less rushed clinic experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
