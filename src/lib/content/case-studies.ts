import type { CaseStudyData } from "@/components/marketing/templates/case-study-page";
import { WORK, type Work } from "@/lib/marketing/work";

/**
 * Case studies for the client sites in work.ts. Only what we know: who the
 * client is, where, what we built, and the live link. PageSpeed scores go in
 * only once measured (with the date), and quotes only with the client's
 * written permission.
 */
const client = (slug: string): Work => {
  const w = WORK.find((x) => x.slug === slug);
  if (!w) throw new Error(`No client "${slug}" in work.ts`);
  return w;
};

export const CASE_STUDIES: CaseStudyData[] = [
  {
    slug: "elite-real-estate-partners",
    path: "/work/elite-real-estate-partners",
    work: client("elite"),
    industryLabel: "Real estate brokerage",
    title: "Elite Real Estate Partners Website | ArkiTech Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for Elite Real Estate Partners, a Vermont real estate brokerage, with a link to the live site.",
    kicker: "Case study · Real estate",
    h1: "Elite Real Estate Partners: a website for a Vermont real estate brokerage",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for Elite Real Estate Partners, a real estate brokerage working across Vermont. The site is live at elitehomesvermont.com. This page covers who the client is, what we built, and how to check the site's speed on a phone yourself.",
    sections: [
      {
        h2: "Who is Elite Real Estate Partners?",
        blocks: [
          { p: "Elite Real Estate Partners is a real estate brokerage that works across Vermont, border to border." },
          { todo: "add a sentence about the brokerage in the client's own words (agents, towns, specialties)." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          { p: "A custom website, designed and built by us, for buyers and sellers looking for an agent in Vermont." },
          { todo: "list what the site includes (pages, listings or IDX search, contact and lead forms) and anything we run for them now." },
        ],
      },
    ],
    related: [
      { href: "/industries/real-estate", label: "Websites for real estate agents and brokerages" },
      { href: "/services/websites", label: "Custom website design" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "inspire-campaigns",
    path: "/work/inspire-campaigns",
    work: client("inspire"),
    industryLabel: "Video and visual marketing studio",
    title: "Inspire Campaigns Website | ArkiTech Solutions Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for Inspire Campaigns, a Burlington, Vermont video and visual marketing studio, with the live site.",
    kicker: "Case study · Burlington",
    h1: "Inspire Campaigns: a website for a Burlington video studio",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for Inspire Campaigns, a video and visual marketing studio in Burlington, Vermont. The site is live at inspirecampaigns.com. This page covers who the client is, what we built, and how you can check the site's speed on a phone for yourself.",
    sections: [
      {
        h2: "Who is Inspire Campaigns?",
        blocks: [
          { p: "Inspire Campaigns is a video and visual marketing studio based in Burlington." },
          { todo: "add a sentence about the studio in the client's own words (what they make, who for)." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          { p: "A custom website, designed and built by us, to show the studio's work to the businesses that hire it." },
          { todo: "list what the site includes (portfolio, video, contact or booking) and anything we run for them now." },
        ],
      },
    ],
    related: [
      { href: "/service-areas/burlington", label: "Website design in Burlington" },
      { href: "/services/websites", label: "Custom website design" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "jeffs-seafood",
    path: "/work/jeffs-seafood",
    work: client("jeffs"),
    industryLabel: "Seafood restaurant",
    title: "Jeff's Seafood Website | ArkiTech Solutions Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for Jeff's Seafood, a seafood restaurant in Saint Albans, Vermont, with a link to the live site.",
    kicker: "Case study · Restaurant",
    h1: "Jeff's Seafood: a website for a Saint Albans restaurant",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for Jeff's Seafood, a seafood restaurant in Saint Albans, Vermont. The site is live at jeff-seafood-nine.vercel.app. This page covers who the client is, what we built, and how you can check the site's speed on a phone for yourself.",
    sections: [
      {
        h2: "Who is Jeff's Seafood?",
        blocks: [
          { p: "Jeff's Seafood is a seafood restaurant in Saint Albans, Vermont." },
          { todo: "add a sentence about the restaurant in the owner's words, and confirm whether the site will move to its own domain." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          { p: "A custom website, designed and built by us, so diners can see what's on offer and how to reach the restaurant." },
          { todo: "list what the site includes (menu, hours, ordering or reservations, location)." },
        ],
      },
    ],
    related: [
      { href: "/industries/restaurants", label: "Websites for restaurants" },
      { href: "/services/websites", label: "Custom website design" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "black-sheep-landscaping",
    path: "/work/black-sheep-landscaping",
    work: client("blacksheep"),
    industryLabel: "Landscaping and seasonal property care",
    title: "Black Sheep Landscaping Website | ArkiTech Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for Black Sheep Landscaping, an Essex, Vermont landscaping and seasonal property care company.",
    kicker: "Case study · Essex",
    h1: "Black Sheep Landscaping: a website for an Essex landscaping company",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for Black Sheep Landscaping, a landscaping and seasonal property care company whose home base is Essex, Vermont. The site's address is blacksheepvt.com. This page covers who the client is, what we built, and how to check the site's speed on a phone yourself.",
    sections: [
      {
        h2: "Who is Black Sheep Landscaping?",
        blocks: [
          { p: "Black Sheep Landscaping does landscaping and seasonal property care, with its home base in Essex, Vermont." },
          { todo: "add a sentence about the company in the owner's words (services, towns served)." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          {
            p: "A custom website, designed and built by us, for homeowners comparing landscapers. For a business like this, photos of real job sites do more work than anything else on the page.",
          },
          { todo: "list what the site includes (service pages, job gallery, quote requests)." },
        ],
      },
    ],
    related: [
      { href: "/service-areas/essex", label: "Website design in Essex and Essex Junction" },
      { href: "/industries/landscapers", label: "Websites for landscaping companies" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "villageserver-initiative",
    path: "/work/villageserver-initiative",
    work: client("vsi"),
    industryLabel: "Community and nonprofit outreach",
    title: "VillageServer Initiative Website | ArkiTech Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for the VillageServer Initiative, a community and nonprofit outreach project, with the live site.",
    kicker: "Case study · Nonprofit",
    h1: "VillageServer Initiative: a website for a community nonprofit",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for the VillageServer Initiative, a community and nonprofit outreach project. The site is live at villageservers.org. This page covers who the client is, what we built, and how you can check the site's speed on a phone for yourself.",
    sections: [
      {
        h2: "What is the VillageServer Initiative?",
        blocks: [
          { p: "The VillageServer Initiative is a community and nonprofit outreach project." },
          { todo: "add a sentence about the initiative in its own words (mission, where it works)." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          { p: "A custom website, designed and built by us, to explain the initiative and bring in supporters." },
          { todo: "list what the site includes (programs, donations or volunteering, contact)." },
        ],
      },
    ],
    related: [
      { href: "/industries/nonprofits", label: "Websites for nonprofits" },
      { href: "/services/websites", label: "Custom website design" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "calljoe",
    path: "/work/calljoe",
    work: client("joe"),
    industryLabel: "House and office cleaning",
    title: "CallJoe Cleaning Website | ArkiTech Solutions Case Study",
    description:
      "How ArkiTech Solutions designed and built the website for CallJoe, a house and office cleaning company in Saint Albans, Vermont, and what it has booked.",
    kicker: "Case study · Cleaning",
    h1: "CallJoe: a website for a Saint Albans cleaning company",
    quickAnswer:
      "ArkiTech Solutions designed and built the website for CallJoe, a house and office cleaning company in Saint Albans, Vermont. The site is live at joethecleaner.net, and in October 2026 it booked eight estimates. Below: who the client is, what we built, and how to check the site's speed yourself.",
    sections: [
      {
        h2: "Who is CallJoe?",
        blocks: [
          { p: "CallJoe, formerly Joe The Cleaner, cleans houses and offices in and around Saint Albans, Vermont." },
          { todo: "add a sentence about the business in the owner's words (services, towns served)." },
        ],
      },
      {
        h2: "What did we build?",
        blocks: [
          { p: "A custom website, designed and built by us, that turns visitors into estimate requests." },
          { todo: "list what the site includes (services, estimate form, service area)." },
        ],
      },
      {
        h2: "What has the site done?",
        blocks: [
          { p: "Eight estimates were booked through the new website in October 2026." },
          { todo: "confirm the month and the count, and that CallJoe is happy for it to be published." },
        ],
      },
    ],
    related: [
      { href: "/industries/cleaning-companies", label: "Websites for cleaning companies" },
      { href: "/services/websites", label: "Custom website design" },
      { href: "/work", label: "All client work" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
];
