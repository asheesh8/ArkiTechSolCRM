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
    name: "Websites & ReviewRetainer",
    tagline: "A site that sells, and reviews that keep coming",
    summary:
      "A hand-built site for the way people actually find a local business — on a phone, in a hurry, comparing you against two competitors. Behind it, an admin side showing every lead that comes in, and ReviewRetainer quietly asking your real customers for the Google review that wins you the next one.",
    includes: [
      "Designed mobile-first, then widened",
      "Hand-written components, no drag-and-drop bloat",
      "Admin side: every lead, enquiry, and form fill in one place",
      "ReviewRetainer asks for a Google review after each completed job",
      "Only customers you actually worked for ever get asked",
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
        "The same logic runs the other way once they land. A fast site that captures the enquiry properly, files it where you can see it, and then asks that customer for a review two days after the job is the difference between one sale and a stream of them. That is what ReviewRetainer is for: not a review campaign, just a request that goes out after real work, every time, without anyone remembering to send it.",
      ],
    },
  },
  {
    slug: "automations",
    name: "Automations",
    tagline: "Your stack, wired to work as one",
    summary:
      "Two jobs. The follow-up that always happens, and the tools you already pay for finally talking to each other — scheduling, calendar, CRM, invoicing, email, all connected through their APIs instead of copy-pasted between tabs.",
    includes: [
      "Follow-up sequences by SMS and email",
      "Scheduling wired to your real availability, not a second calendar",
      "APIs connected between the tools you already run",
      "Quote and contract e-signature flow",
      "Invoice reminders that chase for you",
      "Every touch logged against the client record",
    ],
    post: {
      slug: "the-day-three-problem",
      title: "The day-three problem",
      excerpt:
        "Nobody forgets to send the quote. They forget the message after it — and that's the one that closes.",
      readingTime: "4 min read",
      body: [
        "Ask any contractor where their leads leak and they will say pricing. Look at the actual record and it is almost never pricing. It is silence.",
        "The quote goes out same day, because that part feels urgent. Then the job starts, the phone rings, a supplier lets you down, and it is Thursday. The customer who was ready on Tuesday has now had two other quotes land in their inbox.",
        "The fix is unglamorous: a scheduled message on day three that says one useful thing and asks one direct question. It is the least clever automation you can build and reliably the highest earning.",
        "What makes it work is that it is not optional. A reminder you have to action is another task. A sequence that has already gone out by the time you remember it is a closed loop. Same message, completely different outcome.",
        "The second half of the job is less visible and matters just as much. Most businesses are not short of software — they are short of software that talks. The booking tool does not know what the CRM knows, the invoice does not know the job is done, and a person is quietly doing the integration by hand, in tabs, several times a day. Connecting those systems through their APIs does not add a tool. It removes the person in the middle of them.",
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
      readingTime: "5 min read",
      body: [
        "There is a quiet assumption behind every voicemail greeting: that the person calling will wait. For a local trade, they mostly do not. They are working down a list of three numbers, and they stop at whoever picks up.",
        "That makes a missed call different in kind from a missed email. An email waits for you. A call is a customer standing in front of a competitor's door, deciding whether to knock.",
        "So put a number on it. Take a cleaning business missing eight calls in a week — a normal figure, and usually an undercount, because nobody logs the ones that ring out while they are on another job. Say the average job is worth $450, and four in ten of those callers would have booked. That is eight calls, times $450, times forty percent: about $1,440 walking off every week.",
        "Nobody feels $1,440 a week, which is exactly why it persists. It does not arrive as a bill. It arrives as a slightly quieter month, and a reasonable explanation about the season. Run it out over a year and the same arithmetic reaches roughly $75,000 — a full salary's worth of work that was offered and never picked up.",
        "You can move any of those three numbers and the shape holds. Halve the close rate and it is still $720 a week. That is the uncomfortable part: the loss is not sensitive to optimism. It is sensitive to whether the phone gets answered.",
        "A voice agent is not there to sound human or to replace you on the phone. It is there so the ring is answered, the details are captured accurately, and the job is on your calendar before the caller has a reason to try the next number.",
        "The part owners underestimate is the transcript. Not for compliance — for memory. Two weeks later, when the customer says they mentioned the side gate, you can see whether they did.",
      ],
    },
  },
  {
    slug: "crm-portals",
    name: "CRM & Client Portals",
    tagline: "Built around how you already work",
    summary:
      "Not a CRM you bend your business into. One built to your actual workflow — your stages, your fields, your handoffs — with a client portal on the front, and room to keep working the same way when you're three times the size.",
    includes: [
      "Pipeline stages named after your real process",
      "Custom fields and workflows, not a vendor's template",
      "Calls, texts, and notes threaded per contact",
      "Client portal for quotes, contracts, and invoices",
      "Team roles and handoffs as you add people",
      "Built to hold up as the volume grows",
    ],
    post: {
      slug: "your-crm-is-a-notebook",
      title: "Your CRM is a notebook and that's the problem",
      excerpt: "Nothing wrong with a notebook. The problem is it only exists in one van.",
      readingTime: "4 min read",
      body: [
        "Most local businesses run a perfectly good system. It is just distributed across a notebook in the van, a phone's call history, and one person's recall. It works right up until two people need the same answer at once.",
        "The failure is never dramatic. Somebody quotes a job that was already quoted. A customer gets chased for an invoice they settled last week. A callback promised on a Tuesday evening never lands anywhere it can be seen.",
        "Putting everything on one record does not make anyone work harder. It makes the second person able to answer without ringing the first.",
        "The usual next move is to buy something off the shelf, and the usual next problem is that it was built for a sales team with a different job. You end up with stages that do not match your work, required fields nobody fills in, and a system everyone quietly works around. A CRM people avoid is worse than the notebook, because now the information is in two places.",
        "Building to the workflow you already have avoids that entirely. Your stages, your language, your handoffs — so using it is the path of least resistance rather than an extra task. That is also what makes it survive growth: the process does not have to be reinvented when you add a third person, because the system was shaped like the process to begin with.",
        "The test is simple: if the person who normally handles a customer is off for a week, can anyone else pick it up cold? If not, the system is a memory, not a process.",
      ],
    },
  },
  {
    slug: "brand-seo",
    name: "Brand & Local SEO",
    tagline: "Found first, then trusted",
    summary:
      "Google Business Profile, reviews, and a brand that looks like the quality of your actual work — measured, not asserted. We run PageSpeed Insights against your site and your competitors', and the scores go on the record.",
    includes: [
      "PageSpeed Insights audits tracked against every build",
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
        "The other half is the part you can measure. Google publishes exactly how it grades a page through PageSpeed Insights — performance, accessibility, best practices, and SEO — and those grades feed the ranking you are trying to win. We run that audit against your site and against whoever is currently outranking you, keep the numbers on the record, and re-run them after every build. It is the one part of this work where you do not have to take anybody's word for it, including ours.",
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
