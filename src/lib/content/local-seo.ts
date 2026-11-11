import type { ContentPage } from "@/lib/content/types";
import { SOURCES as S } from "@/lib/content/sources";

/**
 * /local-seo guides: Google Business Profile and Google reviews. Present
 * review replies as building trust with the customers who read them, not as a
 * ranking trick, and never suggest incentives for reviews.
 */
export const LOCAL_SEO_GUIDES: ContentPage[] = [
  {
    slug: "google-business-profile-management",
    path: "/local-seo/google-business-profile-management",
    title: "Google Business Profile Management in Vermont | ArkiTech",
    description:
      "What Google Business Profile management covers, what Google says decides local ranking, and how ArkiTech's $300/month Growth Partnership handles it for you.",
    kicker: "Local SEO guide",
    h1: "Google Business Profile management for Vermont businesses",
    quickAnswer:
      "Google Business Profile management means keeping your Google listing complete, accurate and active: hours, services, photos, updates, and replies to reviews. Google says local ranking comes down to relevance, distance and prominence, and that you can't pay for it. ArkiTech manages the profile as part of the $300/month Growth Partnership.",
    sections: [
      {
        h2: "What is a Google Business Profile?",
        blocks: [
          {
            p: "It's the listing that shows your business on Google Maps and in local search results: your name, hours, phone number, photos, reviews and the button to call or get directions. It's free from Google, and for many local businesses it's where a customer decides to call before they ever reach the website.",
          },
        ],
      },
      {
        h2: "What does Google say decides local ranking?",
        blocks: [
          {
            p: "Google names three things: relevance (how well your profile matches the search), distance (how far you are from the person searching), and prominence (how well known your business is, which includes reviews and how other sites refer to you). Google also says you can't pay for or request a better local ranking. [Read Google's explanation](" +
              S.googleLocalRanking.href +
              ").",
          },
        ],
      },
      {
        h2: "What does managing a profile involve?",
        blocks: [
          {
            list: [
              "Keeping your name, address, phone number and hours accurate, including holiday hours.",
              "Choosing the right categories and listing the services you actually offer.",
              "Adding photos of real work and of your business, and keeping them current.",
              "Posting updates when something changes: a new service, a season, an offer.",
              "Asking customers for reviews and replying to the reviews you get.",
              "Keeping the profile's details the same as your website and other listings.",
            ],
          },
        ],
      },
      {
        h2: "What does ArkiTech's Growth Partnership include?",
        blocks: [
          {
            p: "The [Growth Partnership](/pricing) is $300/month for 12 months. It includes a custom website, Google Business Profile management, replies to your Google reviews, 30 review requests a month, unlimited edits, and a PageSpeed 90+ mobile guarantee so the site is fast for visitors on phones.",
          },
          { todo: "list exactly what profile management includes each month (posts, photo updates, Q&A, hours checks) so this section can say it." },
        ],
      },
      {
        h2: "Can I manage my Google Business Profile myself?",
        blocks: [
          {
            p: "Yes. The profile is free, and Google's own help pages walk you through every setting. What most owners lack is the time to keep it current and to reply to every review. That's the part the Growth Partnership takes off your plate.",
          },
        ],
      },
      { h2: "Where does this come from?", blocks: [{ sources: [S.googleLocalRanking, S.googleReviewPolicy] }] },
    ],
    faqs: [
      {
        q: "Does a Google Business Profile cost money?",
        a: "No. A Google Business Profile is free from Google. What costs money, if you pay someone, is the time to keep it accurate, add photos and updates, and reply to reviews. On the Growth Partnership that work is part of the $300/month plan.",
      },
      {
        q: "Will profile management get me into Google's top three?",
        a: "Nobody can promise that. Google says local ranking depends on relevance, distance and prominence, and that you can't pay for a better position. A complete, active profile with genuine reviews gives you the best chance on the parts you control.",
      },
    ],
    related: [
      { href: "/local-seo/google-reviews", label: "How to get more Google reviews, the right way" },
      { href: "/pricing", label: "The Growth Partnership and other plans" },
      { href: "/service-areas", label: "Towns we serve" },
      { href: "/aeo-geo/how-to-get-recommended-by-chatgpt", label: "How to get recommended by ChatGPT" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "google-reviews",
    path: "/local-seo/google-reviews",
    title: "How to Get More Google Reviews the Right Way | ArkiTech",
    description:
      "How to ask customers for Google reviews within Google's rules and the FTC's: no incentives, no filtering, and replies that build trust with future customers.",
    kicker: "Local SEO guide",
    h1: "How to get more Google reviews, the right way",
    quickAnswer:
      "Ask every customer soon after the job, with a direct link to your Google review form, and never offer anything in return. Google forbids incentives and asking only happy customers, and the FTC bans fake and bought reviews. Reply to every review: future customers read the replies as closely as the reviews.",
    sections: [
      {
        h2: "How many Google reviews does a business need?",
        blocks: [
          {
            p: "There's no number. Google doesn't publish a target, and it says prominence, which includes how many reviews you have, is one of several things behind local ranking. For the people reading them, a steady run of recent reviews tells them more than a large old total.",
          },
        ],
      },
      {
        h2: "What do Google's rules say about asking for reviews?",
        blocks: [
          {
            list: [
              "You can ask customers to leave a genuine review.",
              "You can't offer anything for a review: no discounts, free services, gifts or payment.",
              "You can't ask only the customers you expect to be happy, or discourage negative reviews.",
              "You can't post reviews for your own business, or have staff or family do it.",
            ],
          },
          {
            p: "Google removes reviews that break these rules and can restrict a Business Profile that keeps breaking them. [Read Google's policy](" + S.googleReviewPolicy.href + ").",
          },
        ],
      },
      {
        h2: "What does the FTC's rule say?",
        blocks: [
          {
            p: "The FTC's rule on consumer reviews, in effect since October 2024, bans fake reviews, buying positive or negative reviews, undisclosed reviews by insiders, and suppressing reviews with threats or false accusations, and it lets the FTC seek civil penalties. [Read the FTC's questions and answers](" +
              S.ftcReviewRule.href +
              ").",
          },
        ],
      },
      {
        h2: "How do 30 review requests a month work?",
        blocks: [
          {
            p: "On the [Growth Partnership](/pricing) we send 30 review requests a month on your behalf, each with a direct link to your Google review form, so asking happens every month without anyone having to remember it.",
          },
          {
            todo: "describe how requests go out (text, email or both), when after the job, and confirm every customer is asked regardless of how the job went, since Google bans asking only happy customers.",
          },
        ],
      },
      {
        h2: "Why reply to reviews?",
        blocks: [
          {
            p: "Because the next customer reads them. A thank-you on a good review shows you notice; a calm, specific reply to a bad one shows how you handle problems, which is often what a reader really wants to know. The Growth Partnership includes replies to your Google reviews.",
          },
        ],
      },
      {
        h2: "What should I never do?",
        blocks: [
          {
            list: [
              "Buy reviews, or pay anyone who promises them.",
              "Offer a discount, freebie or entry into a draw for a review.",
              "Send review links only to happy customers.",
              "Write reviews for yourself, or ask staff, friends or family to.",
              "Pressure or threaten someone into changing a review.",
            ],
          },
        ],
      },
      { h2: "Where does this come from?", blocks: [{ sources: [S.googleReviewPolicy, S.ftcReviewRule, S.googleLocalRanking] }] },
    ],
    faqs: [
      {
        q: "Can I offer a discount in exchange for a Google review?",
        a: "No. Google's policy forbids offering anything for a review, including discounts, free services and gifts, and the FTC's rule treats bought reviews as deceptive. Ask for an honest review and leave it at that.",
      },
      {
        q: "Can I ask only my happy customers for reviews?",
        a: "No. Google's policy forbids selectively asking customers you expect to leave positive reviews, sometimes called review gating. Ask every customer the same way, and reply to whatever they write.",
      },
      {
        q: "Should I reply to bad reviews?",
        a: "Yes, calmly and specifically. Thank the person, acknowledge the problem without arguing, and say what you did or will do about it. Future customers read the reply to judge how you handle things when they go wrong.",
      },
    ],
    related: [
      { href: "/local-seo/google-business-profile-management", label: "Google Business Profile management" },
      { href: "/blog/reviews-are-the-storefront", label: "Why Google reviews are your storefront now" },
      { href: "/pricing", label: "The Growth Partnership and other plans" },
      { href: "/service-areas", label: "Towns we serve" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
];
