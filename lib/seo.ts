import type { Metadata } from "next";
import { siteSettings } from "@/data/site";
import type { ArticlePage, ServicePage } from "@/lib/site-content";

type SitePage = ArticlePage | ServicePage;

export function buildPageMetadata(page: SitePage): Metadata {
  const url = `/${page.slug}`;

  return {
    title: page.seoTitle,
    description: page.metaDescription,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: page.seoTitle,
      description: page.metaDescription,
      url,
      type: page.type === "article" ? "article" : "website"
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.metaDescription
    }
  };
}

export function buildBreadcrumbSchema(page: SitePage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteSettings.siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.title,
        item: `${siteSettings.siteUrl}/${page.slug}`
      }
    ]
  };
}

export function buildArticleSchema(page: ArticlePage) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.metaDescription,
    dateModified: "2026-04-09",
    mainEntityOfPage: `${siteSettings.siteUrl}/${page.slug}`,
    keywords: page.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: siteSettings.name
    },
    publisher: {
      "@type": "Organization",
      name: siteSettings.name
    }
  };
}

export function buildServiceSchema(page: ServicePage) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    serviceType: page.title,
    provider: {
      "@type": "Person",
      name: siteSettings.name
    },
    areaServed: siteSettings.location,
    description: page.metaDescription,
    url: `${siteSettings.siteUrl}/${page.slug}`
  };
}

export function buildFaqSchema(page: SitePage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
