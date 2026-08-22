/**
 * Town pages for local search.
 *
 * The whole risk with location pages is the doorway page — near-identical
 * copy with the town name swapped, which Google penalises and readers see
 * through instantly. So every entry here has to carry something that could
 * only have been written about that town: its economy, its geography, the
 * kind of business that actually operates there.
 *
 * If you add a town and can't fill `intro` and `local` with something
 * specific, don't add the town.
 */

export type ServiceArea = {
  slug: string;
  town: string;
  /** Shown under the town on the hub page. */
  short: string;
  /** Page title and H1 are built from this. */
  headline: string;
  /** Two or three sentences that could only be about this place. */
  intro: string[];
  /** What we actually see businesses here needing. */
  local: { term: string; detail: string }[];
  /** A real client or connection here. Omitted where we don't have one. */
  proof?: { text: string; href?: string };
  /**
   * A photograph of somewhere in this town that a local would recognise.
   *
   * Shoot these yourselves. A phone photo of Maple Tree Place that you took is
   * worth more here than a stock image — you own it outright, it is definitely
   * the right place, and "we know this town" is the entire argument the page is
   * making. A borrowed photo of Church Street is the same one every other
   * Burlington business is using.
   *
   * If you do use someone else's, it must be licensed for commercial use and
   * `credit` must be filled in. Never CC BY-SA on a commercial page — the
   * ShareAlike clause is more trouble than the picture is worth.
   *
   * Pages render fine without this. Add them as you take them.
   */
  photo?: { src: string; alt: string; credit?: string };
};

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "burlington",
    town: "Burlington",
    short: "Home base. The most competitive local search market in the state.",
    headline: "Website design in Burlington, Vermont",
    intro: [
      "Burlington is where we work from, and it is the hardest place in Vermont to rank. Between Church Street, the waterfront, and the hill, you are competing against every other business in Chittenden County for the same handful of searches — and against national franchises with budgets that dwarf yours.",
      "That competition is exactly why the technical side matters here more than anywhere else in the state. When four businesses all look credible, Google sorts on the things you cannot fake: how fast the page loads on a phone, whether the Business Profile is complete, and how recent the reviews are.",
    ],
    local: [
      {
        term: "You are ranking against franchises",
        detail:
          "National chains with Burlington locations outspend you on ads and lose to you on relevance. A page that is genuinely about Burlington beats a corporate location page every time — but only if it actually loads.",
      },
      {
        term: "Everyone is searching on a phone",
        detail:
          "Foot traffic on Church Street and the waterfront means most of your discovery happens on a phone, often on patchy signal, often mid-walk. A site that takes four seconds has already lost that person.",
      },
      {
        term: "Reviews decide the tie",
        detail:
          "In a market this dense, the three-pack is won on review recency as much as count. Twelve current reviews read better than forty from two years ago.",
      },
    ],
    proof: { text: "We are based here — Ashish studied at Champlain College, a few blocks from Church Street." },
  },
  {
    slug: "essex",
    town: "Essex",
    short: "Trades and home services, where the work still arrives by phone.",
    headline: "Website design in Essex and Essex Junction, Vermont",
    intro: [
      "Essex and Essex Junction run on trades and home services — landscaping, excavation, plowing, HVAC, contractors working out of trucks rather than storefronts. The Five Corners and the Champlain Valley Expo pull traffic through, but most of the work here is booked over the phone, not walked into.",
      "That changes what a website is for. It is not a brochure. It is the thing that decides whether a homeowner calls you or the next result, and the admin side behind it is where those enquiries have to land so none of them get lost in a text thread.",
    ],
    local: [
      {
        term: "The phone is the whole funnel",
        detail:
          "If the job arrives by call, a missed call is a lost job. This is the market where an AI receptionist pays for itself fastest — run the numbers yourself on the receptionist page.",
      },
      {
        term: "Seasonal swings are brutal",
        detail:
          "Spring cleanup and first snow both arrive as a wall of calls. The businesses that handle it are the ones whose booking and follow-up do not depend on somebody remembering.",
      },
      {
        term: "Photos of real work beat stock",
        detail:
          "Homeowners here are comparing job sites, not typography. Your gallery matters more than your hero image.",
      },
    ],
    proof: {
      text: "We built and run the site for Black Sheep Landscaping, whose home base is Essex.",
      href: "https://black-sheep-property-mgmt.vercel.app",
    },
    // Wikimedia Commons, "Essex Junction, Vermont Amtrak.jpg" — public domain.
    photo: {
      src: "/service-areas-essex.jpg",
      alt: "The Amtrak platform at Essex Junction station, Vermont.",
    },
  },
  {
    slug: "stowe",
    town: "Stowe",
    short: "Tourism, lodging, and the seasonal search spike that comes with it.",
    headline: "Website design in Stowe, Vermont",
    intro: [
      "Stowe is a different problem from the rest of Chittenden County, because most of the people searching for you have never been here. They are planning a trip from Boston or New York, on a phone, comparing three lodges or two outfitters, and they will decide in under a minute.",
      "Everything on the Mountain Road lives or dies by that first impression, and the season compresses it. Ski season and foliage bring a spike that a slow site simply cannot convert, and the traffic disappears again before you have had time to fix it.",
    ],
    local: [
      {
        term: "Out-of-state, on a phone, on hotel wifi",
        detail:
          "Your visitor is not local and is not patient. Mobile speed is not a technical nicety in Stowe, it is the entire conversion path.",
      },
      {
        term: "Booking has to be one tap",
        detail:
          "Lodging, tours, rentals, and tables all live or die on whether the booking step works on a phone. We wire scheduling to real availability so you are not fielding double-bookings in February.",
      },
      {
        term: "Seasonality is the strategy",
        detail:
          "Search volume here swings hard between ski season, mud season, and foliage. Content and Business Profile updates should move with it rather than sitting static all year.",
      },
    ],
    // Wikimedia Commons, "The Chin of Mount Mansfield, 2007.jpg" — public domain.
    photo: {
      src: "/service-areas-stowe.jpg",
      alt: "The Chin of Mount Mansfield rising above the treeline near Stowe, Vermont.",
    },
  },
  {
    slug: "winooski",
    town: "Winooski",
    short: "Dense, independent, and walkable — a small-business market of its own.",
    headline: "Website design in Winooski, Vermont",
    intro: [
      "Winooski packs more independent businesses into a square mile than anywhere else in Vermont. Around the Circle and down the riverfront it is restaurants, studios, salons, and small shops — mostly owner-operated, mostly without anyone whose job is the website.",
      "Being next door to Burlington cuts both ways. You get the spillover traffic, and you also get buried under Burlington results unless your pages are explicit about being in Winooski.",
    ],
    local: [
      {
        term: "You get absorbed into Burlington",
        detail:
          "Searches default to the bigger city. A site that never says Winooski will rank for neither.",
      },
      {
        term: "Owner-operated means no time",
        detail:
          "Nobody here is logging into a CMS on a Tuesday night. Unlimited edits exist so you can text us the change instead.",
      },
      {
        term: "Menus and hours are the whole site",
        detail:
          "For most businesses on the Circle, the two things a visitor wants are hours and what you serve. Everything else is decoration.",
      },
    ],
  },
  {
    slug: "williston",
    town: "Williston",
    short: "The commercial corridor — retail, showrooms, and contractors.",
    headline: "Website design in Williston, Vermont",
    intro: [
      "Williston is where Chittenden County does its commerce. Taft Corners and the Route 2 corridor mean retail, showrooms, trades suppliers, and service businesses with actual premises — a different shape of business from downtown Burlington.",
      "It is also where you are most directly up against national retail. The advantage you have is that you are here and they are a location pin; the site has to make that difference obvious in the first screen.",
    ],
    local: [
      {
        term: "Directions and hours get searched most",
        detail:
          "With premises off a busy corridor, the highest-value thing on your site is often the least glamorous: where to turn in, and whether you are open.",
      },
      {
        term: "Big-box competition on every term",
        detail:
          "You will not outspend them. You can out-specify them — local pages, real photos, and a Business Profile that is actually maintained.",
      },
      {
        term: "Quotes over checkouts",
        detail:
          "Most Williston service businesses close on a quote, not a cart. The form and what happens after it matter more than the storefront.",
      },
    ],
  },
  {
    slug: "colchester",
    town: "Colchester",
    short: "Lake-season home services and a college town in the middle of it.",
    headline: "Website design in Colchester, Vermont",
    intro: [
      "Colchester runs on two clocks. Malletts Bay swells through the summer with camps, boats, docks, and everything that services them, and Saint Michael's fills and empties on the academic year.",
      "Both of those are seasonal demand you can plan for, which is unusual and genuinely useful. The businesses that do well here are the ones whose follow-up and booking are already running before the season lands.",
    ],
    local: [
      {
        term: "Summer arrives all at once",
        detail:
          "Dock work, landscaping, cleaning, and rentals all spike together. Automated follow-up is the difference between a booked season and a backlog of voicemails.",
      },
      {
        term: "Two audiences, one site",
        detail:
          "Lakeside seasonal customers and year-round residents want different things. The navigation should not make either one hunt.",
      },
      {
        term: "Word of mouth still needs a landing spot",
        detail:
          "Referrals here are strong, but the referred person still Googles you first. What they find decides whether the referral converts.",
      },
    ],
    // Wikimedia Commons, "Malletsbaycauseway.JPG" — public domain.
    photo: {
      src: "/service-areas-colchester.jpg",
      alt: "The Colchester Causeway path running out between the waters of Lake Champlain.",
    },
  },
  {
    slug: "south-burlington",
    town: "South Burlington",
    short: "Professional services, medical, and the airport corridor.",
    headline: "Website design in South Burlington, Vermont",
    intro: [
      "South Burlington is where a lot of Chittenden County's professional work actually happens — medical and dental practices, law and accounting offices, and the commercial stretch along Dorset Street, with the airport at the edge of it.",
      "This is a market where credibility does more work than personality. Someone choosing a dentist or an accountant is scanning for signals that you are established, current, and easy to reach, and they are making that judgement in seconds.",
    ],
    local: [
      {
        term: "Trust is the conversion",
        detail:
          "Professional services are chosen on confidence. A dated site actively costs you clients who never call to find out you are good.",
      },
      {
        term: "Accessibility is not optional",
        detail:
          "Medical and public-facing practices have a real obligation here, and most template sites fail it. We build to it and test for it.",
      },
      {
        term: "Intake is the bottleneck",
        detail:
          "Booking, forms, and reminders are where practices lose hours a week. That is automation work, not design work.",
      },
    ],
    // Wikimedia Commons, "South Burlington City Hall, 180 Market Street.jpg" — CC0.
    photo: {
      src: "/service-areas-south-burlington.jpg",
      alt: "South Burlington Public Library and City Hall on Market Street.",
    },
  },
];

export function getServiceArea(slug: string) {
  return SERVICE_AREAS.find((a) => a.slug === slug);
}
