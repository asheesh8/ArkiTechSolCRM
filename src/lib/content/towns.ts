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
    slug: "burlington",
    path: "/service-areas/burlington",
    town: "Burlington",
    title: "Website Design in Burlington, Vermont | ArkiTech Solutions",
    description:
      "ArkiTech Solutions is a Burlington, Vermont web design studio: fast custom websites, Google Business Profile and review management, and AEO & GEO builds.",
    kicker: "Burlington, Vermont",
    h1: "Website design in Burlington, Vermont",
    quickAnswer:
      "ArkiTech Solutions is a Burlington web design studio. We build fast custom websites, run Google Business Profiles and reviews, and build AEO & GEO pages for answer engines. Burlington is Vermont's most competitive local search market, so speed, a complete profile and recent reviews decide who gets the call.",
    local: [
      {
        term: "You're ranking against franchises",
        detail:
          "National chains with Burlington locations outspend you on ads and lose to you on relevance. A page that is genuinely about Burlington beats a corporate location page, but only if it actually loads.",
      },
      {
        term: "Everyone is searching on a phone",
        detail:
          "Foot traffic on Church Street and the waterfront means most discovery happens on a phone, often on patchy signal, often mid-walk. A site that takes four seconds has already lost that person.",
      },
      {
        term: "Reviews decide the tie",
        detail:
          "In a market this dense, review recency matters as much as count. Twelve current reviews read better than forty from two years ago.",
      },
    ],
    proof:
      "We're based here, and Ashish studied at Champlain College, a few blocks from Church Street. In Burlington we built the site for [Inspire Campaigns](/work/inspire-campaigns), a video and visual marketing studio.",
    todo: "add a photo of Burlington you took yourselves (Church Street, the waterfront), with descriptive alt text.",
    sections: [
      {
        h2: "Which plan suits a Burlington business?",
        blocks: [
          {
            p: "In a market this competitive, the [Growth Partnership](/pricing) is usually the fit: the website, your Google Business Profile, 30 review requests a month and replies to every review, for $300/month over 12 months. If you want a new site and already have Google covered, the [Custom Website](/services/websites) is a $1,000 build with a monthly plan you can cancel anytime.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Are you actually based in Burlington?",
        a: "Yes. ArkiTech Solutions is a two-person studio in Burlington, Vermont, and the people you talk to are the people who build your site. We work with businesses across Chittenden County and remotely with clients anywhere in the US.",
      },
      {
        q: "How do Burlington businesses show up in Google's map results?",
        a: "Google says local results are based on relevance, distance and prominence. In practice that means a complete Business Profile, a website that clearly says what you do in Burlington, and a steady flow of genuine reviews. You can't pay Google for a better map position.",
        link: { href: "/local-seo/google-business-profile-management", label: "Google Business Profile management" },
      },
    ],
    related: [
      { href: "/local-seo/google-business-profile-management", label: "Google Business Profile management" },
      { href: "/local-seo/google-reviews", label: "Getting more Google reviews, the right way" },
      { href: "/industries/restaurants", label: "Websites for restaurants" },
      { href: "/industries/real-estate", label: "Websites for real estate" },
      { href: "/aeo-geo/how-to-get-recommended-by-chatgpt", label: "How to get recommended by ChatGPT" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "south-burlington",
    path: "/service-areas/south-burlington",
    town: "South Burlington",
    title: "Website Design in South Burlington, VT | ArkiTech Solutions",
    description:
      "Websites for South Burlington, Vermont practices and professional firms: credible, accessible, fast on phones, with Google profiles and reviews looked after.",
    kicker: "South Burlington, Vermont",
    h1: "Website design in South Burlington, Vermont",
    quickAnswer:
      "South Burlington is where much of Chittenden County's professional work happens: medical and dental practices, law and accounting offices, the Dorset Street corridor. ArkiTech Solutions builds their websites from nearby Burlington, where credibility, accessibility and easy contact matter more than flash. Plans start at a $1,000 custom website.",
    local: [
      {
        term: "Trust is the conversion",
        detail:
          "Professional services are chosen on confidence. Someone picking a dentist or an accountant scans for signs you're established, current and easy to reach, and decides in seconds. A dated site costs you clients who never call to find out you're good.",
      },
      {
        term: "Accessibility isn't optional",
        detail:
          "Medical and public-facing practices have a real obligation to be usable by everyone, and many template sites fall short. We build to accessibility standards and test for them.",
      },
      {
        term: "Intake is the bottleneck",
        detail:
          "Booking, forms and reminders are where practices lose hours a week. Getting every enquiry into one place, with the [CRM dashboard](/services/dashboards), is most of the fix.",
      },
    ],
    todo: "add a South Burlington client or connection if there is one, and confirm the Dorset Street and airport-corridor description.",
    photo: {
      src: "/service-areas-south-burlington.jpg",
      width: 1800,
      height: 771,
      alt: "South Burlington Public Library and City Hall on Market Street.",
      credit: "South Burlington Public Library and City Hall on Market Street. Wikimedia Commons, CC0.",
    },
    sections: [
      {
        h2: "Which plan suits a South Burlington practice?",
        blocks: [
          {
            p: "A practice that relies on Google to bring in new patients or clients usually fits the [Growth Partnership](/pricing): the website plus Google Business Profile management, review requests and replies. A firm that only needs a credible, fast site can start with the [Custom Website](/services/websites), and add dashboards such as Scheduling for $50/month each.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Do you build websites for medical and professional offices?",
        a: "Yes. Most of South Burlington's businesses are practices and offices, and their sites have to look established, load fast on a phone and make it easy to call or book. We build each site by hand rather than from a template.",
      },
      {
        q: "Can you help with scheduling?",
        a: "The Scheduling dashboard is an add-on at $50/month that syncs every calendar you use into one view, so appointments booked in different places show up together. It's available on both website plans.",
        todo: "confirm which booking tools you connect, and whether online booking is part of the build.",
      },
    ],
    related: [
      { href: "/services/dashboards", label: "Dashboards & CRM" },
      { href: "/local-seo/google-reviews", label: "Getting more Google reviews, the right way" },
      { href: "/service-areas/burlington", label: "Website design in Burlington" },
      { href: "/pricing", label: "Plans and pricing" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "winooski",
    path: "/service-areas/winooski",
    town: "Winooski",
    title: "Website Design in Winooski, Vermont | ArkiTech Solutions",
    description:
      "Websites for Winooski, Vermont restaurants, studios and shops: pages that say Winooski, show hours and menus plainly, and load fast on phones near the Circle.",
    kicker: "Winooski, Vermont",
    h1: "Website design in Winooski, Vermont",
    quickAnswer:
      "Winooski packs independent businesses around the Circle and the riverfront: restaurants, studios, salons and shops, mostly owner-run. ArkiTech Solutions builds their websites from next door in Burlington, with pages that name Winooski plainly so they aren't buried under Burlington results. Plans start at a $1,000 custom website.",
    local: [
      {
        term: "You get absorbed into Burlington",
        detail: "Searches default to the bigger city next door. A site that never says Winooski will rank for neither.",
      },
      {
        term: "Owner-run means no time",
        detail:
          "Nobody here is logging into a website editor on a Tuesday night. On the Growth Partnership, edits are unlimited, so you send us the change and we make it.",
      },
      {
        term: "Menus and hours are the whole site",
        detail:
          "For most businesses on the Circle, the two things a visitor wants are your hours and what you serve or sell. Everything else is decoration.",
      },
    ],
    todo: "add a Winooski client or connection if there is one, and a current photo of the Circle or riverfront you took yourselves.",
    photo: {
      src: "/service-areas-winooski.jpg",
      width: 1800,
      height: 771,
      alt: "The Champlain Mill beside the falls on the Winooski River, photographed in the mid-twentieth century.",
      credit: "The Winooski mill on the falls, still standing, now offices and shops. Wikimedia Commons, public domain.",
    },
    sections: [
      {
        h2: "Which plan suits a Winooski business?",
        blocks: [
          {
            p: "If you want the website, your Google listing and your reviews handled without thinking about them, the [Growth Partnership](/pricing) covers all three, with unlimited edits. If you just need a fast site with your hours and menu, the [Custom Website](/services/websites) is a $1,000 build.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: "Will my site show up for Winooski searches, not just Burlington ones?",
        a: "That's the point of saying Winooski on the page and in your Google Business Profile. Google matches results to what a profile and site say about location, so a business that names its town clearly gives Google and AI tools what they need to place it.",
      },
      {
        q: "Can you update our menu and hours when they change?",
        a: "Yes. On the Growth Partnership edits are unlimited, so menu changes, seasonal hours and new photos are just a message to us. We also keep your Google Business Profile hours in step with the site.",
      },
    ],
    related: [
      { href: "/industries/restaurants", label: "Websites for restaurants" },
      { href: "/local-seo/google-business-profile-management", label: "Google Business Profile management" },
      { href: "/service-areas/burlington", label: "Website design in Burlington" },
      { href: "/pricing", label: "Plans and pricing" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
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
