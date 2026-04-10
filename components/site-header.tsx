"use client";

import Link from "next/link";
import { useState } from "react";
import { navigationItems, siteSettings } from "@/data/site";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="section-shell">
        <div className="surface-panel hairline flex items-center justify-between rounded-[28px] px-4 py-3 shadow-[0_18px_45px_rgba(47,39,29,0.07)] sm:px-5">
          <Link href="/" className="min-w-0" onClick={() => setIsOpen(false)}>
            <div className="text-[0.7rem] uppercase tracking-[0.28em] text-brand-deep/80">Alora</div>
            <div className="truncate font-serif text-xl tracking-[-0.04em] text-foreground sm:text-2xl">
              {siteSettings.name}
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-[0.01em] text-muted transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="hidden xl:block text-right">
              <div className="text-[0.64rem] uppercase tracking-[0.24em] text-muted">Call the clinic</div>
              <a href="tel:09558276875" className="text-sm text-foreground transition-colors hover:text-brand-deep">
                0955-827-6875
              </a>
            </div>
            <Link
              href="/#services"
              className="button-secondary-light inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
            >
              View Services
            </Link>
            <a href={`tel:${siteSettings.name ? "09558276875" : ""}`} className="text-sm text-muted transition-colors hover:text-foreground xl:hidden">
              0955-827-6875
            </a>
            <Link
              href="/#contact"
              className="button-primary-brand inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
            >
              Book Appointment
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white/70 text-foreground lg:hidden"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              {isOpen ? (
                <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
              )}
            </svg>
          </button>
        </div>

        {isOpen ? (
          <div
            id="mobile-navigation"
            className="surface-panel hairline mt-3 rounded-[28px] px-5 py-5 shadow-[0_18px_45px_rgba(47,39,29,0.07)] lg:hidden"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-black/[0.06] pb-4 text-base text-foreground last:border-b-0 last:pb-0"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a href="tel:09558276875" className="pt-2 text-sm text-muted" onClick={() => setIsOpen(false)}>
                0955-827-6875
              </a>
              <Link
                href="/#contact"
                className="button-primary-brand mt-2 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                Book Appointment
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
