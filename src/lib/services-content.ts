/**
 * Service and blog content for the marketing site.
 *
 * Capabilities described here map to things this codebase actually ships — Twilio voice
 * and SMS, ElevenLabs agents, the CRM lead/client tables, e-sign, invoices, PageSpeed
 * checks. Nothing here promises a feature that does not exist.
 */

export type DemoPost = {
  slug: string;
  title: string;
  excerpt: string;
  readingTime: string;
  body: string[];
};

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  includes: string[];
  post: DemoPost;
};

export const services: Service[] = [
  {
    slug: "websites",
    name: "Websites",
    tagline: "Fast, hand-built, and yours",
    summary:
      "A site built for the way people actually find a local business: on a phone, in a hurry, comparing you against two competitors. Built from scratch, no page builder, no template tax.",
    includes: [
      "Designed mobile-first, then widened",
      "Hand-written components, no drag-and-drop bloat",
      "Booking and quote forms wired to your CRM",
      "Speed budget enforced before launch",
      "You own the domain, the code, and the content",
    ],
    post: {
      slug: "speed-is-a-sales-number",
      title: "Speed is a sales number, not a tech number",
      excerpt:
        "A second of load time is not an engineering statistic. It's the gap between a customer calling you and calling the next result.",
      readingTime: "4 min read",
      body: [
        "Most small business owners get handed a performance score and told it matters, without anyone explaining why. So it goes in the same mental folder as the tyre pressure light — probably important, definitely someone else's job.",
        "Here is the version that matters. Someone searches for what you do. They tap the first result. If it hangs, they do not wait and think about your craftsmanship. They hit back and tap the next one. That is the entire mechanism, and it happens before a single word of your copy gets read.",
        "This is why we refuse page builders. A builder ships the code for every feature it might ever need, on every page, whether you use it or not. You end up paying for a toolbox on every single visit. Hand-written pages ship what the page uses and nothing else.",
        "The practical effect on a phone, on rural signal, is the difference between a site that appears and a site that loads. In our experience that gap is where most local leads quietly go missing — not to a better competitor, just to a faster one.",
      ],
    },
  },
  {
    slug: "automations",
    name: "Automations",
    tagline: "The follow-up that always happens",
    summary:
      "The jobs you lose are rarely the ones you quoted badly. They're the ones where nobody followed up on day three. Automations close that gap without adding a person.",
    includes: [
      "Lead capture straight into the pipeline",
      "Follow-up sequences by SMS and email",
      "Quote and contract e-signature flow",
      "Invoice reminders that chase for you",
      "Every touch logged against the client record",
    ],
    post: {
      slug: "the-day-three-problem",
      title: "The day-three problem",
      excerpt:
        "Nobody forgets to send the quote. They forget the message after it — and that's the one that closes.",
      readingTime: "3 min read",
      body: [
        "Ask any contractor where their leads leak and they will say pricing. Look at the actual record and it is almost never pricing. It is silence.",
        "The quote goes out same day, because that part feels urgent. Then the job starts, the phone rings, a supplier lets you down, and it is Thursday. The customer who was ready on Tuesday has now had two other quotes land in their inbox.",
        "The fix is unglamorous: a scheduled message on day three that says one useful thing and asks one direct question. It is the least clever automation you can build and reliably the highest earning.",
        "What makes it work is that it is not optional. A reminder you have to action is another task. A sequence that has already gone out by the time you remember it is a closed loop. Same message, completely different outcome.",
      ],
    },
  },
  {
    slug: "ai-receptionist",
    name: "AI Receptionist",
    tagline: "Nobody reaches a voicemail",
    summary:
      "A voice agent that answers when you're up a ladder, takes the details properly, and books straight into the calendar. Every call transcribed and filed against the lead.",
    includes: [
      "Answers overflow and after-hours calls",
      "Captures name, number, job type, and address",
      "Books into your live calendar",
      "Full transcript on the client timeline",
      "Hands off to a real number on request",
    ],
    post: {
      slug: "what-a-missed-call-costs",
      title: "What a missed call actually costs",
      excerpt: "The caller who hits voicemail does not leave a message. They dial the next number.",
      readingTime: "4 min read",
      body: [
        "There is a quiet assumption behind every voicemail greeting: that the person calling will wait. For a local trade, they mostly do not. They are working down a list of three numbers, and they stop at whoever picks up.",
        "That makes a missed call different in kind from a missed email. An email waits for you. A call is a customer standing in front of a competitor's door, deciding whether to knock.",
        "A voice agent is not there to sound human or to replace you on the phone. It is there so the ring is answered, the details are captured accurately, and the job is on your calendar before the caller has a reason to try the next number.",
        "The part owners underestimate is the transcript. Not for compliance — for memory. Two weeks later, when the customer says they mentioned the side gate, you can see whether they did.",
      ],
    },
  },
  {
    slug: "crm-portals",
    name: "CRM & Client Portals",
    tagline: "One record per customer",
    summary:
      "Leads, clients, calls, texts, notes, contracts, and invoices against a single record — instead of split between a notebook, a phone, and somebody's memory.",
    includes: [
      "Lead pipeline with real stages",
      "Calls and texts threaded per contact",
      "Notes and activity timeline",
      "Contracts out for signature",
      "Invoices and payment status",
    ],
    post: {
      slug: "your-crm-is-a-notebook",
      title: "Your CRM is a notebook and that's the problem",
      excerpt: "Nothing wrong with a notebook. The problem is it only exists in one van.",
      readingTime: "3 min read",
      body: [
        "Most local businesses run a perfectly good system. It is just distributed across a notebook in the van, a phone's call history, and one person's recall. It works right up until two people need the same answer at once.",
        "The failure is never dramatic. Somebody quotes a job that was already quoted. A customer gets chased for an invoice they settled last week. A callback promised on a Tuesday evening never lands anywhere it can be seen.",
        "Putting everything on one record does not make anyone work harder. It makes the second person able to answer without ringing the first.",
        "The test is simple: if the person who normally handles a customer is off for a week, can anyone else pick it up cold? If not, the system is a memory, not a process.",
      ],
    },
  },
  {
    slug: "brand-seo",
    name: "Brand & Local SEO",
    tagline: "Found first, then trusted",
    summary:
      "Google Business Profile, review generation, and a brand that looks like the quality of your actual work. Being findable and being credible are the same job.",
    includes: [
      "Google Business Profile built out properly",
      "Review requests that go out automatically",
      "Location pages for the towns you serve",
      "Logo, palette, and type that hold up in print",
      "Photography direction for real job sites",
    ],
    post: {
      slug: "reviews-are-the-storefront",
      title: "Reviews are the storefront now",
      excerpt:
        "Customers walk past your business in the search results. What they see there is your window display.",
      readingTime: "4 min read",
      body: [
        "A high street business knows what its window looks like. A local trade often has no idea what its equivalent is, because the window is a search result and nobody stands in front of it.",
        "That result is your star rating, your review count, the recency of the last one, and whether anybody replied. A prospect reads all four in about two seconds and decides whether to keep scrolling.",
        "Review count matters more than most owners expect, and recency matters more than count. Forty reviews with the newest from two years ago reads worse than twelve that are current. It suggests you were good once.",
        "This is why asking has to be systematic rather than heroic. Not a push, not a campaign — a request that goes out after every completed job, forever, without anyone deciding to send it.",
      ],
    },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getPost(slug: string) {
  const service = services.find((s) => s.post.slug === slug);
  return service ? { service, post: service.post } : undefined;
}
