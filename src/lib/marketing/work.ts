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
};

export const WORK: Work[] = [
  {
    slug: "elite",
    mobileH: 5400,
    fullH: 5600,
    name: "Elite Real Estate Partners",
    kind: "client",
    what: "Real estate brokerage",
    where: "Vermont, border to border",
    url: "https://elitehomesvermont.com",
    host: "elitehomesvermont.com",
  },
  {
    slug: "inspire",
    mobileH: 5400,
    fullH: 5568,
    name: "Inspire Campaigns",
    kind: "client",
    what: "Video and visual marketing studio",
    where: "Burlington",
    url: "https://inspirecampaigns.com",
    host: "inspirecampaigns.com",
  },
  {
    slug: "jeffs",
    mobileH: 5400,
    fullH: 5600,
    name: "Jeff's Seafood",
    kind: "client",
    what: "Seafood restaurant",
    where: "Saint Albans",
    url: "https://jeff-seafood-nine.vercel.app",
    host: "jeff-seafood-nine.vercel.app",
  },
  {
    slug: "blacksheep",
    mobileH: 5400,
    fullH: 5118,
    name: "Black Sheep Landscaping",
    kind: "client",
    what: "Landscaping and seasonal property care",
    where: "Essex",
    url: "https://black-sheep-property-mgmt.vercel.app",
    host: "black-sheep-property-mgmt.vercel.app",
  },
  {
    slug: "vsi",
    mobileH: 5400,
    fullH: 5541,
    name: "VillageServer Initiative",
    kind: "client",
    what: "Community and nonprofit outreach",
    url: "https://villageservers.org",
    host: "villageservers.org",
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
