export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

type BasePage = {
  type: "article" | "service";
  slug: string;
  title: string;
  summary: string;
  seoTitle: string;
  metaDescription: string;
  relatedLinks: Array<{ label: string; href: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  cta: {
    title: string;
    description: string;
    label: string;
    href: string;
  };
  content: ContentBlock[];
};

export type ArticlePage = BasePage & {
  type: "article";
  readTime: number;
  lastUpdated: string;
  primaryIntent: string;
  keywords: string[];
};

export type ServicePage = BasePage & {
  type: "service";
  category: string;
  highlights: string[];
  testimonials: Array<{
    quote: string;
    name: string;
    context: string;
  }>;
};

export const articlePages: ArticlePage[] = [
  {
    type: "article",
    slug: "blog/teeth-cleaning-cost-philippines",
    title: "How Much Is Teeth Cleaning in the Philippines?",
    seoTitle: "How Much Is Teeth Cleaning in the Philippines? | Alora Dental Clinic",
    metaDescription:
      "A modern dental article template covering what affects teeth cleaning costs in the Philippines, what patients can expect, and when to book.",
    summary:
      "Teeth cleaning costs can vary based on plaque buildup, gum condition, and the type of care you need. This article helps patients understand what usually affects pricing and when professional cleaning is worth prioritizing.",
    readTime: 6,
    lastUpdated: "Updated April 10, 2026",
    primaryIntent: "Preventive care and pricing education",
    keywords: ["teeth cleaning cost", "dental cleaning philippines", "oral prophylaxis"],
    cta: {
      title: "Want a personalized recommendation for your oral health needs?",
      description: "A consultation can help clarify whether you need routine cleaning, more frequent maintenance, or a broader treatment plan.",
      label: "Book a Consultation",
      href: "/contact"
    },
    relatedLinks: [
      {
        label: "How Much Do Braces Cost in the Philippines?",
        href: "/blog/braces-cost-philippines",
        description: "A treatment-cost article for patients comparing orthodontic options."
      },
      {
        label: "Dental Implant Cost Philippines 2025",
        href: "/blog/dental-implant-cost-philippines-2025",
        description: "A high-intent guide to one of the most considered restorative treatments."
      },
      {
        label: "Services",
        href: "/services",
        description: "Explore preventive, cosmetic, restorative, and orthodontic care."
      }
    ],
    faqs: [
      {
        question: "How often should you get your teeth cleaned?",
        answer: "For many patients, routine cleaning once or twice a year is a common baseline. Some may need more frequent visits depending on gum health, tartar buildup, or other dental concerns."
      },
      {
        question: "Does professional cleaning hurt?",
        answer: "Routine cleaning is usually manageable for most patients, though sensitivity can vary. A gentle clinic approach and clear communication can make the visit feel much easier."
      },
      {
        question: "Why not just rely on brushing at home?",
        answer: "Home care is essential, but professional cleaning helps remove buildup and monitor issues that may not be obvious during daily brushing and flossing."
      }
    ],
    content: [
      {
        type: "paragraph",
        text: "Many patients search for teeth cleaning cost because they want something simple: a healthier mouth, a fresher smile, and a clearer sense of what the visit might involve."
      },
      { type: "heading", text: "What usually affects the price" },
      {
        type: "paragraph",
        text: "Pricing often depends on whether the visit is a routine preventive cleaning or whether there is more significant buildup, gum sensitivity, or a need for additional assessment."
      },
      { type: "subheading", text: "Common factors patients should know" },
      {
        type: "list",
        items: [
          "How much plaque or tartar has built up",
          "Whether gums are inflamed or need closer attention",
          "If diagnostic imaging or consultation is needed first",
          "How regularly the patient has had preventive care"
        ]
      },
      { type: "heading", text: "What the appointment should feel like" },
      {
        type: "paragraph",
        text: "A modern clinic experience should feel calm, clearly explained, and efficient. Patients tend to feel more comfortable when the dentist explains what is happening, what the cleaning involves, and whether any follow-up is recommended."
      }
    ]
  },
  {
    type: "article",
    slug: "blog/braces-cost-philippines",
    title: "How Much Do Braces Cost in the Philippines?",
    seoTitle: "How Much Do Braces Cost in the Philippines? | Alora Dental Clinic",
    metaDescription:
      "A modern orthodontics article template covering what affects braces cost in the Philippines and how patients can think about treatment options.",
    summary:
      "Braces pricing depends on the type of orthodontic system, treatment complexity, and how long the case may take. This article gives patients a clearer framework for comparing options.",
    readTime: 7,
    lastUpdated: "Updated April 10, 2026",
    primaryIntent: "Orthodontic treatment planning",
    keywords: ["braces cost", "orthodontics philippines", "clear aligners"],
    cta: {
      title: "Comparing braces and aligner options?",
      description: "The right treatment depends on goals, comfort preferences, and the complexity of alignment needed.",
      label: "Ask About Orthodontic Options",
      href: "/contact"
    },
    relatedLinks: [
      {
        label: "How Much Is Teeth Cleaning in the Philippines?",
        href: "/blog/teeth-cleaning-cost-philippines",
        description: "A preventive care article for patients starting with routine oral health."
      },
      {
        label: "Dental Implant Cost Philippines 2025",
        href: "/blog/dental-implant-cost-philippines-2025",
        description: "A restorative treatment guide for patients comparing longer-term solutions."
      },
      {
        label: "Doctor",
        href: "/doctor",
        description: "Learn more about Alora’s calm, patient-first treatment philosophy."
      }
    ],
    faqs: [
      {
        question: "Why do braces prices vary so much?",
        answer: "The total cost often depends on the orthodontic system used, the complexity of the alignment problem, treatment duration, and whether additional steps are needed during the plan."
      },
      {
        question: "Are clear aligners more expensive than braces?",
        answer: "Sometimes. It depends on the case, the aligner system, and how complex the movement needs to be. A consultation is usually the best way to compare real options accurately."
      },
      {
        question: "How do I know which orthodontic option is right for me?",
        answer: "The right choice depends on your goals, oral condition, lifestyle preferences, and how visible or discreet you want the treatment to be."
      }
    ],
    content: [
      {
        type: "paragraph",
        text: "When patients search for braces cost, they are rarely looking for a single number. They are trying to understand what kind of treatment they may need and whether the investment feels worth it."
      },
      { type: "heading", text: "What affects braces pricing" },
      {
        type: "paragraph",
        text: "Different orthodontic systems, case complexity, follow-up frequency, and treatment length can all affect the overall plan. That is why a clinic should frame pricing with context rather than vague promises."
      },
      { type: "subheading", text: "Questions worth asking during a consultation" },
      {
        type: "list",
        items: [
          "What type of orthodontic system fits my case best?",
          "How long is treatment likely to take?",
          "Will I need retainers or follow-up appliances after treatment?",
          "Are there alternatives like clear aligners for my goals?"
        ]
      },
      { type: "heading", text: "Why the clinic experience matters too" },
      {
        type: "paragraph",
        text: "Orthodontic treatment is not only about price. Patients also need a clinic they trust to explain progress, manage expectations, and make a longer treatment journey feel organized and reassuring."
      }
    ]
  },
  {
    type: "article",
    slug: "blog/dental-implant-cost-philippines-2025",
    title: "Dental Implant Cost Philippines 2025",
    seoTitle: "Dental Implant Cost Philippines 2025 | Alora Dental Clinic",
    metaDescription:
      "A modern dental implant article template covering what usually affects implant pricing, why treatment planning matters, and what patients should ask before committing.",
    summary:
      "Dental implants are one of the most considered restorative treatments, so patients need more than a price point. They need clarity on planning, long-term value, and what makes one case different from another.",
    readTime: 8,
    lastUpdated: "Updated April 10, 2026",
    primaryIntent: "Restorative treatment planning",
    keywords: ["dental implant cost", "tooth implant philippines", "restorative dentistry"],
    cta: {
      title: "Thinking about implants as a long-term solution?",
      description: "A consultation can help determine whether implants are appropriate, what preparation may be needed, and how the treatment plan should be staged.",
      label: "Book an Implant Consultation",
      href: "/contact"
    },
    relatedLinks: [
      {
        label: "How Much Is Teeth Cleaning in the Philippines?",
        href: "/blog/teeth-cleaning-cost-philippines",
        description: "A preventive care guide for patients maintaining long-term oral health."
      },
      {
        label: "How Much Do Braces Cost in the Philippines?",
        href: "/blog/braces-cost-philippines",
        description: "An orthodontic planning article for another high-intent treatment category."
      },
      {
        label: "Services",
        href: "/services",
        description: "Explore Alora’s restorative, cosmetic, preventive, and urgent care services."
      }
    ],
    faqs: [
      {
        question: "Why do dental implant costs vary so much?",
        answer: "Implant pricing often reflects treatment complexity, the number of implants needed, supportive procedures, materials used, and the overall restorative plan."
      },
      {
        question: "Are implants worth considering over other options?",
        answer: "For many patients, implants are considered because they can offer a more durable and stable long-term restorative solution. The right option still depends on oral condition, budget, and treatment goals."
      },
      {
        question: "What should I ask before committing to implant treatment?",
        answer: "Ask about the full treatment sequence, what preparation may be needed, how long the process might take, and what kind of long-term maintenance to expect."
      }
    ],
    content: [
      {
        type: "paragraph",
        text: "Patients researching implant cost are usually thinking beyond a single appointment. They are trying to understand whether implants make sense as a long-term solution for function, confidence, and daily comfort."
      },
      { type: "heading", text: "What shapes the total treatment plan" },
      {
        type: "paragraph",
        text: "Implant treatment is rarely just one line item. Planning may involve diagnostics, assessment of oral health, restorative decisions, and a timeline that depends on the condition of the tooth and surrounding structures."
      },
      { type: "subheading", text: "Key areas patients should understand" },
      {
        type: "list",
        items: [
          "How many teeth need to be replaced",
          "Whether supportive procedures are needed first",
          "What restorative result is being planned",
          "How long the treatment sequence may take"
        ]
      },
      { type: "heading", text: "Why clarity matters before treatment begins" },
      {
        type: "paragraph",
        text: "Because implants are a significant decision, patients benefit from a clinic that explains the process calmly and clearly. That clarity helps the treatment feel less intimidating and more grounded in a realistic plan."
      }
    ]
  }
];

export const servicePages: ServicePage[] = [
  {
    type: "service",
    slug: "projects/launch-kit",
    title: "Launch Kit",
    seoTitle: "Launch Kit Project | Alex Carter",
    metaDescription:
      "A project concept for helping founders or freelancers turn a rough idea into a clear, testable launch page.",
    summary:
      "Launch Kit is a compact website concept built around one goal: helping someone explain a new idea clearly enough to earn its first real users.",
    category: "Featured project",
    highlights: ["Clear messaging", "Fast launch flow", "Conversion-minded layout"],
    testimonials: [
      {
        quote: "This feels like the sort of page that could turn a vague side project into something people actually understand.",
        name: "Sample collaborator",
        context: "Feedback on clarity"
      },
      {
        quote: "The strongest part is how quickly it gets to the point without feeling cold or generic.",
        name: "Early reviewer",
        context: "Feedback on writing"
      },
      {
        quote: "I could imagine using this as a reusable foundation for product experiments.",
        name: "Founder friend",
        context: "Feedback on utility"
      }
    ],
    cta: {
      title: "Want to build a first version of your own idea?",
      description: "A focused website can be the fastest path from concept to feedback.",
      label: "Start a conversation",
      href: "/contact"
    },
    relatedLinks: [
      {
        label: "Creator Dashboard",
        href: "/projects/creator-dashboard",
        description: "Another concept that explores how product thinking becomes interface structure."
      },
      {
        label: "How Much Do Braces Cost in the Philippines?",
        href: "/blog/braces-cost-philippines",
        description: "A high-intent orthodontic article shaped for treatment research."
      }
    ],
    faqs: [
      {
        question: "Is this a real shipped product or a portfolio concept?",
        answer: "Right now it is presented as a portfolio concept: a believable, fully framed idea that shows product thinking, writing, and interface direction."
      },
      {
        question: "Why feature concept projects on a personal site?",
        answer: "Concepts can still reveal how you think, what you prioritize, and how you shape an experience from problem to interface."
      },
      {
        question: "What would the next step be for this project?",
        answer: "A natural next step would be building a small interactive version with editable sections, analytics, and a lightweight signup flow."
      }
    ],
    content: [
      {
        type: "paragraph",
        text: "Launch Kit is built around a simple tension: lots of people have promising ideas, but they struggle to package those ideas into a page that feels clear, focused, and credible."
      },
      { type: "heading", text: "What the project is trying to solve" },
      {
        type: "paragraph",
        text: "Instead of giving users dozens of layout decisions, the concept narrows the experience to the essentials: what the idea is, why it matters, and what action comes next."
      },
      { type: "subheading", text: "Core ingredients" },
      {
        type: "list",
        items: [
          "A strong hero section with one clear promise",
          "Reusable content blocks for trust, proof, and next steps",
          "Enough flexibility to feel personal without becoming overwhelming",
          "A structure that encourages quick publishing over endless tweaking"
        ]
      },
      { type: "heading", text: "Why it belongs in this portfolio" },
      {
        type: "paragraph",
        text: "This page shows the intersection of product thinking, writing, and frontend presentation. It is less about one specific business and more about how I like to make ideas legible."
      }
    ]
  },
  {
    type: "service",
    slug: "projects/creator-dashboard",
    title: "Creator Dashboard",
    seoTitle: "Creator Dashboard Project | Alex Carter",
    metaDescription:
      "A portfolio concept for a calm, single-screen workspace that helps creators manage content planning, publishing, and performance.",
    summary:
      "Creator Dashboard imagines a quieter control center for people juggling drafts, publishing schedules, and audience signals across too many tools.",
    category: "Featured project",
    highlights: ["Unified workflow", "Editorial UI", "Decision support"],
    testimonials: [
      {
        quote: "This idea understands the emotional side of tooling. It feels less like software overload and more like guidance.",
        name: "Design peer",
        context: "Feedback on product framing"
      },
      {
        quote: "The concept is strongest when it turns scattered metrics into a few next actions that feel manageable.",
        name: "Content strategist",
        context: "Feedback on usefulness"
      },
      {
        quote: "I like that the interface vision is practical instead of trying to be futuristic for its own sake.",
        name: "Product reviewer",
        context: "Feedback on direction"
      }
    ],
    cta: {
      title: "Need a sharper product story for your own idea?",
      description: "Strong product pages are often built from a few very intentional choices about audience and workflow.",
      label: "Get in touch",
      href: "/contact"
    },
    relatedLinks: [
      {
        label: "Launch Kit",
        href: "/projects/launch-kit",
        description: "A complementary project focused on fast clarity and first-user momentum."
      },
      {
        label: "Dental Implant Cost Philippines 2025",
        href: "/blog/dental-implant-cost-philippines-2025",
        description: "A restorative treatment article for patients comparing longer-term solutions."
      }
    ],
    faqs: [
      {
        question: "Who is this concept for?",
        answer: "It is aimed at solo creators or very small teams who are tired of switching between planning boards, analytics tabs, and publishing tools."
      },
      {
        question: "What makes this concept different from a generic dashboard?",
        answer: "The focus is not on showing every number. It is on helping someone decide what deserves attention next."
      },
      {
        question: "Could this become a real product?",
        answer: "Yes. A first version could start with content planning, publishing checkpoints, and a compact performance summary."
      }
    ],
    content: [
      {
        type: "paragraph",
        text: "Creator Dashboard is a response to a familiar problem: the tools meant to help creative work often scatter attention instead of organizing it."
      },
      { type: "heading", text: "A calmer control center" },
      {
        type: "paragraph",
        text: "The concept pulls planning, publishing, and performance into one clear workspace. The goal is not maximal control. It is a sense of orientation."
      },
      { type: "subheading", text: "What the interface emphasizes" },
      {
        type: "list",
        items: [
          "What is scheduled and what is slipping",
          "Which pieces of content deserve another push",
          "Where audience traction is rising or fading",
          "The next action that matters most right now"
        ]
      },
      { type: "heading", text: "Why it matters in this site" },
      {
        type: "paragraph",
        text: "Like the rest of this portfolio, the project is less about volume and more about direction. It shows the kind of product thinking I enjoy bringing into early-stage work."
      }
    ]
  }
];

const allPages = [...articlePages, ...servicePages];

export function getAllPagePaths() {
  return allPages.map((page) => page.slug);
}

export function getAllPageSlugs() {
  return getAllPagePaths();
}

export function getPageBySlugSegments(slugSegments: string[]) {
  const slug = slugSegments.join("/");
  return allPages.find((page) => page.slug === slug);
}
