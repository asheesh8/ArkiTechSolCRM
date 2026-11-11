/**
 * The work we show. Clients first, then builds we made to show the craft.
 * Which is which is stated on the page, never blurred.
 *
 * Images are full-page captures taken by research/scripts/capture-work.mjs:
 * `cover` is the first screen, `full` the page to about 5,600px, `mobile` the
 * phone layout.
 */
export type Work = {
  slug: string;
  name: string;
  kind: "client" | "demo";
  what: string;
  where?: string;
  url: string;
  /** The address as a visitor would read it. */
  host: string;
  /** Height of the 1200px-wide full-page capture. */
  fullH: number;
  /** Height of the 390px-wide phone capture. */
  mobileH: number;
  /** The /work/[caseSlug] case study for a client. */
  caseSlug?: string;
  /** The /industries page this client belongs to, if any. */
  industry?: "landscapers" | "cleaning-companies" | "real-estate" | "restaurants" | "contractors" | "nonprofits";
  /** The /service-areas page for the client's town, if we have one. */
  townPage?: string;
  /** Something the owner must check before this entry is relied on. Never rendered in production. */
  ownerTodo?: string;
};

export const WORK: Work[] = [
  {
    slug: "elite",
    caseSlug: "elite-real-estate-partners",
    mobileH: 5400,
    fullH: 5600,
    name: "Elite Real Estate Partners",
    kind: "client",
    what: "Real estate brokerage",
    where: "Vermont, border to border",
    url: "https://elitehomesvermont.com",
    industry: "real-estate",
    host: "elitehomesvermont.com",
  },
  {
    slug: "inspire",
    caseSlug: "inspire-campaigns",
    mobileH: 5400,
    fullH: 5568,
    name: "Inspire Campaigns",
    kind: "client",
    what: "Video and visual marketing studio",
    where: "Burlington",
    url: "https://inspirecampaigns.com",
    townPage: "burlington",
    host: "inspirecampaigns.com",
  },
  {
    slug: "jeffs",
    caseSlug: "jeffs-seafood",
    mobileH: 5400,
    fullH: 5600,
    name: "Jeff's Seafood",
    kind: "client",
    what: "Seafood restaurant",
    where: "Saint Albans",
    url: "https://jeff-seafood-nine.vercel.app",
    industry: "restaurants",
    host: "jeff-seafood-nine.vercel.app",
  },
  {
    slug: "blacksheep",
    caseSlug: "black-sheep-landscaping",
    mobileH: 5400,
    fullH: 5118,
    name: "Black Sheep Landscaping",
    kind: "client",
    what: "Landscaping and seasonal property care",
    where: "Essex",
    url: "https://blacksheepvt.com",
    industry: "landscapers",
    townPage: "essex",
    ownerTodo: "TODO(owner): confirm blacksheepvt.com is live. On Nov 4, 2026 it returned 503 DEPLOYMENT_PAUSED.",
    host: "blacksheepvt.com",
  },
  {
    slug: "vsi",
    caseSlug: "villageserver-initiative",
    mobileH: 5400,
    fullH: 5541,
    name: "VillageServer Initiative",
    kind: "client",
    what: "Community and nonprofit outreach",
    url: "https://villageservers.org",
    industry: "nonprofits",
    ownerTodo: "TODO(owner): villageservers.org credits ArkiTech in text but doesn't link to us. Ask for a linked credit.",
    host: "villageservers.org",
  },
  {
    slug: "joe",
    caseSlug: "calljoe",
    mobileH: 5400,
    fullH: 5600,
    name: "CallJoe",
    kind: "client",
    what: "House and office cleaning",
    where: "Saint Albans",
    url: "https://www.joethecleaner.net",
    industry: "cleaning-companies",
    host: "joethecleaner.net",
  },
  {
    slug: "bbopenbox",
    mobileH: 4621,
    fullH: 2179,
    name: "BB Open Box",
    kind: "demo",
    what: "E-commerce and product finder",
    url: "https://bb-openbox.vercel.app",
    host: "bb-openbox.vercel.app",
  },
  {
    slug: "ashish",
    mobileH: 5400,
    fullH: 4874,
    name: "Ashish Subedi",
    kind: "demo",
    what: "Personal portfolio",
    url: "https://ashish.network",
    host: "ashish.network",
  },
];

export const workImage = (slug: string, v: "cover" | "full" | "mobile") => `/work/${slug}-${v}.webp`;
