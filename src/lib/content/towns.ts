import type { TownPageData } from "@/components/marketing/templates/town-page";

/**
 * Town pages for local search. The risk with location pages is the doorway
 * page: the same copy with the town name swapped, which Google penalises and
 * readers see through. Every entry has to carry something that could only be
 * written about that town. If you can't fill `local` with something specific,
 * don't add the town.
 *
 * Photos: licensed for commercial use, credit filled in. Better still, shoot
 * your own; "we know this town" is the whole argument of the page.
 */
export const TOWNS: TownPageData[] = [
  {
    slug: "essex",
    path: "/service-areas/essex",
    town: "Essex",
    title: "Website Design in Essex & Essex Junction, VT | ArkiTech",
    description:
      "Custom websites, Google Business Profile management and AEO & GEO pages for Essex and Essex Junction, Vermont businesses, from a studio in nearby Burlington.",
    kicker: "Essex & Essex Junction, Vermont",
    h1: "Website design in Essex and Essex Junction, Vermont",
    quickAnswer:
      "ArkiTech Solutions builds websites for Essex and Essex Junction businesses, most of which book work by phone: trades, home services and contractors. Plans run from a $1,000 custom website to a $300/month Growth Partnership that adds Google Business Profile and review management. We're based in nearby Burlington.",
    local: [
      {
        term: "The call starts with a search",
        detail:
          "Essex and Essex Junction run on trades and home services: landscaping, excavation, plowing, HVAC, contractors working out of trucks rather than storefronts. If the job arrives by call, the caller found you first on Google or in the reviews, so that is where the work gets won.",
      },
      {
        term: "Seasonal swings are brutal",
        detail:
          "Spring cleanup and first snow both arrive as a wall of calls. The businesses that handle it are the ones whose enquiries land somewhere they can be seen, not in a text thread.",
      },
      {
        term: "Photos of real work beat stock",
        detail: "Homeowners here are comparing job sites, not typography. Your gallery matters more than your hero image.",
      },
    ],
    proof: "We built the website for [Black Sheep Landscaping](/work/black-sheep-landscaping), whose home base is Essex.",
    todo: "add a detail only a local would know about doing business in Essex or Essex Junction (a street, an event, a season), and confirm the Five Corners and Champlain Valley Expo mentions are how you'd put it.",
    photo: {
      src: "/service-areas-essex.jpg",
      width: 1800,
      height: 771,
      alt: "The Amtrak platform at Essex Junction station, Vermont.",
      credit: "The Amtrak platform at Essex Junction station. Wikimedia Commons, public domain.",
    },
    sections: [
      {
        h2: "Which plan suits an Essex business?",
        blocks: [
          {
            p: "If most of your work comes from people finding you on Google, the [Growth Partnership](/pricing) covers the website, your Google Business Profile, review requests and review replies in one plan. If you only need the website and will look after Google yourself, the [Custom Website](/services/websites) is a one-time build with a monthly plan you can cancel anytime.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Do you work with businesses in Essex Junction?",
        a: "Yes. Essex and Essex Junction are part of our main service area, along with Burlington, South Burlington, Winooski, Williston and the rest of Chittenden County. We also work remotely with businesses anywhere in the US.",
      },
      {
        q: "How long does a website take?",
        a: "Two to four weeks for a standard site, from the first call to launch. The variable is usually how quickly we get your photos, your service list and your feedback on the first draft.",
      },
    ],
    related: [
      { href: "/industries/landscapers", label: "Websites for landscapers" },
      { href: "/industries/contractors", label: "Websites for contractors" },
      { href: "/local-seo/google-business-profile-management", label: "Google Business Profile management" },
      { href: "/pricing", label: "Plans and pricing" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
];
