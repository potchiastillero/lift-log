import type { ArticlePage, ServicePage } from "@/lib/site-content";
import { articlePages, servicePages } from "@/lib/site-content";

export const siteSettings = {
  name: "Alora Dental Clinic",
  location: "Quezon City",
  siteUrl: "https://aloradentalclinic.com",
  defaultTitle: "Alora Dental Clinic | Premium Dental Care in Quezon City",
  defaultDescription:
    "Modern, reassuring dental care in Quezon City with a premium patient experience, advanced treatment options, and a clear path to book."
};

export const navigationItems = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Doctor", href: "/doctor" },
  { label: "FAQ", href: "/#faq" }
];

export const footerLinks = [
  {
    title: "Explore",
    items: [
      { label: "Home", href: "/" },
      { label: "About the Clinic", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Blog", href: "/blog" },
      { label: "Doctor", href: "/doctor" },
      { label: "Book an Appointment", href: "/contact" }
    ]
  },
  {
    title: "Care",
    items: [
      { label: "General Dentistry", href: "/services" },
      { label: "Cosmetic Dentistry", href: "/services" },
      { label: "Dental Implants", href: "/services" },
      { label: "Emergency Dental Care", href: "/services" }
    ]
  }
];

export const contactDetails = {
  phone: "0955-827-6875",
  email: "hello@aloradentalclinic.com",
  address: "Quezon City, Metro Manila",
  bookingNote: "Appointment-based scheduling for a calmer, more private visit."
};

export const officeHours = [
  { day: "Monday to Friday", hours: "10:00 AM - 7:00 PM" },
  { day: "Saturday", hours: "10:00 AM - 5:00 PM" },
  { day: "Sunday", hours: "By arrangement for select cases" }
];

export const heroStats = [
  { value: "Google-reviewed", label: "Trusted by local families and returning patients" },
  { value: "Appointment-first", label: "Designed to reduce waiting and keep visits calm" },
  { value: "Modern care", label: "Digital diagnostics, clear planning, and gentle attention" }
];

export const clinicProofPoints = [
  {
    value: "High-trust care",
    label: "Known for gentle treatment, clean surroundings, and attentive follow-through"
  },
  {
    value: "Patient-first flow",
    label: "Appointment-based scheduling for a more private, less rushed visit"
  },
  {
    value: "Modern dentistry",
    label: "Diagnostics and treatment planning built around clarity and precision"
  },
  {
    value: "Comfort-led philosophy",
    label: "Clear explanations, calm pacing, and care that never feels transactional"
  }
];

export const trustSignals = [
  {
    kicker: "Reviews",
    title: "Trusted by patients who value clarity, gentleness, and a polished clinical experience.",
    description: "The current clinic reputation consistently highlights comfort, cleanliness, and attentive care."
  },
  {
    kicker: "Approach",
    title: "A more private, appointment-led flow that respects your time from consultation to follow-up.",
    description: "Clear communication and considered scheduling reduce friction before treatment even begins."
  },
  {
    kicker: "Technology",
    title: "Modern dentistry, explained simply so treatment decisions feel informed and reassuring.",
    description: "Advanced methods matter most when they make care more precise, comfortable, and predictable."
  }
];

export const clinicHighlights = [
  {
    kicker: "Calm environment",
    title: "A clinic experience that feels elevated, not clinical in the cold sense.",
    description: "Warm materials, clean lines, and quiet confidence shape how patients feel from the first step in."
  },
  {
    kicker: "Thoughtful communication",
    title: "Every recommendation is explained in plain language, with options when appropriate.",
    description: "That means less uncertainty, fewer surprises, and more confidence in your treatment plan."
  },
  {
    kicker: "Long-term care",
    title: "Care plans built for healthy maintenance, not only one-time procedures.",
    description: "The goal is not just a better appointment today, but better oral health over time."
  }
];

export const serviceHighlights = [
  {
    title: "General Dentistry",
    description:
      "Consultations, cleaning, preventive care, restorations, and essential treatment planned with clarity and comfort in mind.",
    accent: "Foundation care",
    bullets: ["Routine exams and consultations", "Professional cleaning and prevention", "Restorations, extractions, and essential treatment"]
  },
  {
    title: "Cosmetic Dentistry",
    description:
      "Refined smile enhancements that prioritize natural-looking results and treatment plans tailored to your features.",
    accent: "Confidence-led",
    bullets: ["Smile design guidance", "Natural-looking cosmetic refinements", "Tailored options based on goals and features"]
  },
  {
    title: "Dental Implants",
    description:
      "Comprehensive implant care for patients looking for durable, precise tooth replacement with a premium clinical approach.",
    accent: "Precision restoration",
    bullets: ["Tooth replacement planning", "Long-term restorative function", "Precision-led treatment coordination"]
  },
  {
    title: "Invisalign",
    description:
      "Discreet aligner treatment for patients who want straighter teeth with a cleaner, lifestyle-friendly orthodontic option.",
    accent: "Subtle alignment",
    bullets: ["Discreet orthodontic option", "Lifestyle-friendly treatment path", "Clearer smile planning with modern comfort"]
  },
  {
    title: "Teeth Whitening",
    description:
      "Professional whitening designed to lift brightness elegantly and safely, without the guesswork of at-home kits.",
    accent: "High-impact refresh",
    bullets: ["Professional-strength whitening", "Safer than trial-and-error kits", "Designed for a fresh, polished result"]
  },
  {
    title: "Emergency Dental Care",
    description:
      "Fast access for urgent dental concerns, with a reassuring process that helps you feel looked after right away.",
    accent: "Urgent support",
    bullets: ["Urgent pain or damage assessment", "Prompt guidance on next steps", "A calmer process during stressful situations"]
  }
];

export const doctorProfile = {
  name: "Dra. Angelica",
  role: "Lead Dentist",
  summary:
    "Patients consistently describe Alora’s care as gentle, attentive, and clearly explained. That credibility is central to the brand: expert dentistry delivered with warmth, composure, and real follow-through.",
  points: [
    "Calm chairside manner that helps anxious patients feel more at ease",
    "Treatment recommendations explained clearly before work begins",
    "A premium clinical environment built around hygiene, comfort, and trust"
  ]
};

export const patientStories = [
  {
    quote:
      "The clinic feels elegant and meticulously clean, but what stayed with me most was how gently everything was explained before treatment began.",
    name: "Bianca R.",
    context: "Cleaning and restorative care",
    rating: "5.0"
  },
  {
    quote:
      "I came in nervous and left feeling genuinely taken care of. The experience felt organized, calming, and far more thoughtful than any clinic I had visited before.",
    name: "Marco T.",
    context: "Consultation and extraction",
    rating: "5.0"
  },
  {
    quote:
      "Alora strikes the balance you hope for: modern, polished, and still deeply human. It feels like care designed around the patient, not around speed.",
    name: "Jasmine L.",
    context: "Cosmetic treatment planning",
    rating: "5.0"
  }
];

export const safetyAssurances = [
  "Clear treatment explanations before work begins",
  "Gentle approach for anxious or first-time patients",
  "Clean, polished environment with strong hygiene standards",
  "Transparent planning so patients feel informed, not pressured"
];

export const serviceCategories = [
  {
    title: "General Dentistry",
    description: "Preventive and essential dental care that keeps oral health stable, comfortable, and well monitored.",
    items: ["Dental Consultation", "Teeth Cleaning", "Tooth Extraction", "Fluoride Treatment"]
  },
  {
    title: "Cosmetic Dentistry",
    description: "Aesthetic treatments designed to enhance smile confidence while keeping results refined and natural.",
    items: ["Dental Veneers", "Diastema Closure", "Teeth Whitening"]
  },
  {
    title: "Prosthodontics",
    description: "Restorative solutions focused on function, comfort, and a polished long-term result.",
    items: ["Dental Crown", "Dental Bridges", "Dental Implant", "Dentures"]
  },
  {
    title: "Orthodontics",
    description: "Modern alignment options for patients who want straighter teeth with a cleaner treatment journey.",
    items: ["Clear Aligners", "Metallic Braces", "Sapphire Braces", "Dental Retainers"]
  },
  {
    title: "Oral Surgery",
    description: "More advanced procedures handled with careful planning, clear explanation, and patient comfort in mind.",
    items: ["Wisdom Tooth Extraction", "Root Canal Treatment"]
  },
  {
    title: "Diagnostics",
    description: "Supportive imaging and assessment that make treatment plans more precise and more reassuring.",
    items: ["Periapical X-Ray"]
  }
];

export const migrationNotes = {
  source: "Alora Dental Clinic.xlsx",
  summary:
    "The current spreadsheet shows strong existing service coverage and strong search demand from blog-style treatment and pricing content, which makes a future CMS or content migration especially valuable.",
  contentPriorities: [
    "Keep core conversion pages focused on trust, services, and booking",
    "Later migrate high-traffic educational pages into a content hub or blog",
    "Preserve service taxonomy so future pages map cleanly to real treatments"
  ]
};

export const insuranceOptions = [
  "Flexible payment options",
  "Transparent treatment planning",
  "Clear estimates before major procedures",
  "Support for discussing coverage and reimbursement"
];

export const homeFaqs = [
  {
    question: "Do I need to book ahead before visiting?",
    answer:
      "Yes. Alora follows an appointment-first approach so visits feel more private, punctual, and carefully prepared."
  },
  {
    question: "What treatments can I ask about during a consultation?",
    answer:
      "You can discuss preventive care, cosmetic goals, implants, Invisalign, whitening, and urgent concerns. The first step is understanding your needs and options clearly."
  },
  {
    question: "Do you offer options for nervous patients?",
    answer:
      "Yes. The clinic experience is designed to feel calm and reassuring, with clear explanations and a gentler treatment flow that helps reduce anxiety."
  },
  {
    question: "Can I ask about payment before treatment begins?",
    answer:
      "Absolutely. Transparent treatment planning is part of the patient experience, so costs and options should feel clear before you commit."
  }
];

export const featuredServices: ServicePage[] = servicePages;
export const featuredArticles: ArticlePage[] = articlePages;
export const homeStats = heroStats.map((item) => ({
  label: item.value,
  value: item.label,
  copy: item.label
}));
export const testimonials = patientStories;
