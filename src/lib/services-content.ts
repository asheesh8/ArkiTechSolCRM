/**
 * Service and blog content for the marketing site.
 *
 * The three services, each with its own page: custom websites, dashboards and CRM, and
 * AI search optimization. The Growth Partnership bundles them and lives on /pricing.
 * Prices are not written here; they come from the pricing table.
 */

export type DemoPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** The search-result snippet: 140-160 characters, the topic named outright. */
  description: string;
  /** ISO dates. `updated` moves only when the body changes. */
  published: string;
  updated: string;
  readingTime: string;
  body: string[];
};

export type Service = {
  slug: string;
  name: string;
  /** What people search for this, as the page title, H1 and snippet carry it. */
  seo: { title: string; h1: string; description: string };
  tagline: string;
  summary: string;
  includes: string[];
  /** The blog post that goes with this service, if there is one. */
  post?: DemoPost;
};

export const services: Service[] = [
  {
    slug: "websites",
    name: "Custom Websites",
    seo: {
      title: "Custom Small Business Website Design | ArkiTech",
      h1: "Custom small business website design",
      description:
        "A hand-built website for a one-time fee, for businesses anywhere in the US, with an optional monthly plan that adds the Overview and CRM dashboards.",
    },
    tagline: "Built to bring in leads",
    summary:
      "A hand-built website, fast on a phone and designed around how your customers actually find you. Pay once for the build. Add the monthly plan if you want the Overview and CRM dashboards behind it, and cancel whenever you like.",
    includes: [
      "Custom design and build, mobile-first",
      "Hand-written, no page builder",
      "Google PageSpeed performance guarantee",
      "Optional monthly plan, cancel anytime",
      "Monthly plan adds the Overview and CRM dashboards",
      "More dashboards can be added on the monthly plan",
    ],
    post: {
      slug: "speed-is-a-sales-number",
      title: "Speed is a sales number, not a tech number",
      excerpt:
        "A second of load time is not an engineering statistic. It's the gap between a customer calling you and calling the next result.",
      description:
        "Why page speed is a sales number for a local business: a slow site on a phone loses the caller to the next search result before they read a word.",
      published: "2026-08-19",
      updated: "2026-10-21",
      readingTime: "4 min read",
      body: [
        "Most small business owners get handed a performance score and told it matters, without anyone explaining why. So it goes in the same mental folder as the tyre pressure light: probably important, definitely someone else's job.",
        "Here is the version that matters. Someone searches for what you do. They tap the first result. If it hangs, they do not wait and think about your craftsmanship. They hit back and tap the next one. That is the entire mechanism, and it happens before a single word of your copy gets read.",
        "This is why we refuse page builders. A builder ships the code for every feature it might ever need, on every page, whether you use it or not. You end up paying for a toolbox on every single visit. Hand-written pages ship what the page uses and nothing else.",
        "The practical effect on a phone, on rural signal, is the difference between a site that appears and a site that loads. In our experience that gap is where most local leads quietly go missing. Not to a better competitor, just to a faster one.",
        "The same logic runs the other way once they land. A fast site that captures the enquiry properly and files it where you can see it is the difference between a visit and a booked job. That is what the CRM dashboard behind the site is for: every enquiry in one place, so none of them sit unanswered in an inbox.",
      ],
    },
  },
  {
    slug: "dashboards",
    name: "Dashboards & CRM",
    seo: {
      title: "Business Dashboards & CRM for Small Businesses | ArkiTech",
      h1: "Business dashboards and CRM for small businesses",
      description:
        "Overview and CRM dashboards for your leads and clients, plus Analytics, Finance, an AI Assistant and Scheduling when you need them.",
    },
    tagline: "Your whole business in one place",
    summary:
      "The Overview and CRM dashboards come with the Growth Partnership and with the Custom Website's monthly plan: every lead and client in one place, and the state of the business at a glance. Add Analytics, Finance, an AI Assistant or Scheduling when you need them.",
    includes: [
      "Overview: the state of the business at a glance",
      "CRM: every lead and client in one place",
      "Analytics: Google Analytics, Meta and your social media, connected",
      "Finance: quote generation, money in and out",
      "AI Assistant: answers drawn from all your centralized data",
      "Scheduling: every calendar synced into one",
    ],
    post: {
      slug: "your-crm-is-a-notebook",
      title: "Your CRM is a notebook and that's the problem",
      excerpt: "Nothing wrong with a notebook. The problem is it only exists in one van.",
      description:
        "When the customer list lives in one notebook in one van, leads get lost. Why small businesses outgrow paper, and what a simple CRM changes.",
      published: "2026-08-19",
      updated: "2026-10-21",
      readingTime: "4 min read",
      body: [
        "Most local businesses run a perfectly good system. It is just distributed across a notebook in the van, a phone's call history, and one person's recall. It works right up until two people need the same answer at once.",
        "The failure is never dramatic. Somebody quotes a job that was already quoted. A customer gets chased for an invoice they settled last week. A callback promised on a Tuesday evening never lands anywhere it can be seen.",
        "Putting everything on one record does not make anyone work harder. It makes the second person able to answer without ringing the first.",
        "Putting every lead and client in one dashboard is what changes that. The CRM dashboard holds every enquiry your website brings in and every client you have worked with, so the second person can answer without ringing the first.",
        "The test is simple: if the person who normally handles a customer is off for a week, can anyone else pick it up cold? If not, the system is a memory, not a process.",
      ],
    },
  },
  {
    slug: "ai-search",
    name: "AI Search Optimization",
    seo: {
      title: "AI Search Optimization for Local Businesses | ArkiTech",
      h1: "AI search optimization for local businesses",
      description:
        "200 unique keyword-driven pages, built so ChatGPT, Claude and other AI answer engines recommend your business when customers ask who to hire.",
    },
    tagline: "Get recommended when people ask AI",
    summary:
      "People increasingly ask ChatGPT or Claude who to hire, not just Google. We build 200 unique, keyword-driven pages so AI answer engines have something specific to recommend you for.",
    includes: [
      "200 unique pages",
      "Each one built around a keyword your customers use",
      "Written to be recommended by ChatGPT, Claude and other AI answer engines",
      "One-time build",
    ],
    post: {
      slug: "reviews-are-the-storefront",
      title: "Reviews are the storefront now",
      excerpt:
        "Customers walk past your business in the search results. What they see there is your window display.",
      description:
        "Google reviews are the first thing a local customer sees. How review count and recency decide who gets the call, and how to ask every customer.",
      published: "2026-08-19",
      updated: "2026-10-21",
      readingTime: "4 min read",
      body: [
        "A high street business knows what its window looks like. A local trade often has no idea what its equivalent is, because the window is a search result and nobody stands in front of it.",
        "That result is your star rating, your review count, the recency of the last one, and whether anybody replied. A prospect reads all four in about two seconds and decides whether to keep scrolling.",
        "Review count matters more than most owners expect, and recency matters more than count. Forty reviews with the newest from two years ago reads worse than twelve that are current. It suggests you were good once.",
        "This is why asking has to be systematic rather than heroic. Not a push, not a campaign: a request that goes out after every completed job, forever, without anyone deciding to send it.",
      ],
    },
  },
];

/** The services that have a blog post, which is what the blog lists. */
export const servicesWithPosts = services.filter((s): s is Service & { post: DemoPost } => s.post != null);

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getPost(slug: string) {
  const service = services.find((s) => s.post?.slug === slug);
  return service?.post ? { service, post: service.post } : undefined;
}
