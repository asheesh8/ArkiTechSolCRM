/**
 * Facts the whole public site repeats: the footer, the contact blocks, the
 * JSON-LD, llms.txt and the sitemap all read them from here. Change a fact in
 * this file and nowhere else.
 *
 * Never put anything here that isn't true today. Where the owner still has to
 * decide something, the field carries a `TODO(owner)` comment instead of a
 * guess.
 */
export const SITE = {
  name: "ArkiTech Solutions",
  legalName: "ArkiTech Solutions LLC",
  /** Other names people and directories use for the business. */
  alternateNames: ["ArkiTech", "ArkiTech Solutions LLC"],
  /** Canonical origin: apex, https, no trailing slash. */
  url: "https://arkitech-sol.com",
  phone: "(802) 557-8828",
  phoneE164: "+1-802-557-8828",
  phoneHref: "tel:+18025578828",
  // TODO(owner): confirm the public email. It may move to @arkitech-sol.com; change it here only.
  email: "studio@sol-arkitech.com",
  /**
   * The public address, the same as Google Business Profile and BBB. Burlington
   * and Chittenden County are the market the copy leads with; this is where the
   * studio is.
   */
  locality: { street: "122 West St", city: "Essex Junction", region: "VT", regionName: "Vermont", postalCode: "05452", country: "US" },
  /** One-line address for contact blocks. */
  address: "122 West St, Essex Junction, VT 05452",
  studio: "Essex Junction, Vermont",
  hours: "Mon-Fri, 8am-7pm",
  openingHours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "19:00" },
  /** Where clients can be: Chittenden County first, remote anywhere in the US second. */
  reach: "Chittenden County, Vermont, and remote clients anywhere in the US",
  // TODO(owner): confirm the founding month. BBB lists a start date of Jul 23, 2026.
  founded: "2026",
} as const;

/**
 * The people. Ashish's direct line belongs on his bio only; every NAP block
 * uses SITE.phone.
 */
export const PEOPLE = [
  {
    id: "ashish",
    name: "Ashish Subedi",
    jobTitle: "CEO & Fullstack Designer",
    from: "Nepal",
    initials: "AS",
    alumniOf: "Champlain College",
    directPhone: "(802) 310-3749",
    directPhoneHref: "tel:+18023103749",
    sameAs: ["https://www.linkedin.com/in/ashish-subedi2"],
  },
  {
    id: "terri",
    // TODO(owner): confirm which name is public. "Terri Ambo" is shown; "Teibiroa Ambo" is kept as alternateName.
    name: "Terri Ambo",
    alternateName: "Teibiroa Ambo",
    jobTitle: "CEO & Director of Client Relations",
    from: "Kiribati",
    initials: "TA",
    directPhone: "(802) 557-8828",
    directPhoneHref: "tel:+18025578828",
    sameAs: [] as string[],
  },
] as const;

/**
 * Where we work. The towns are the primary service area, in this order, then
 * the state; remote clients anywhere in the US are secondary. Towns with a
 * `page` have a /service-areas page.
 */
export const AREA_SERVED = {
  towns: [
    { name: "Burlington", page: "burlington" },
    { name: "South Burlington", page: "south-burlington" },
    { name: "Winooski", page: "winooski" },
    { name: "Essex", page: "essex" },
    { name: "Essex Junction" },
    { name: "Williston" },
    { name: "Colchester" },
    { name: "Shelburne" },
    { name: "St. Albans" },
    { name: "Stowe" },
  ],
  state: "Vermont",
  remote: "Remote clients anywhere in the US",
} as const;

/**
 * Profiles that are the business. Only non-empty ones are rendered or put in
 * `sameAs`; fill the empty ones as each profile is claimed.
 */
export const PROFILES = {
  googleBusinessProfile: "https://maps.google.com/?cid=16353977033327328632",
  facebook: "https://www.facebook.com/p/ArkiTech-Solutions-61591979698342/",
  bbb: "https://www.bbb.org/us/vt/essex-junction/profile/web-design/arkitech-solutions-0021-575880",
  // TODO(owner): claim these, then paste the URLs. Note: linkedin.com/company/arkitech-solutions is a different company.
  linkedinCompany: "",
  bingPlaces: "",
  yelp: "",
  clutch: "",
  appleBusinessConnect: "",
} as const;

/** The profile URLs that exist, for schema `sameAs`. */
export const SAME_AS: string[] = Object.values(PROFILES).filter(Boolean);

/** Pages every visitor might want, beyond the three services. Nav and footer share it. */
export const PAGE_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
] as const;

/** Guides and local pages, linked from the footer. */
export const GUIDE_LINKS = [
  { href: "/aeo-geo", label: "AEO & GEO" },
  { href: "/local-seo", label: "Local SEO" },
  { href: "/service-areas", label: "Service areas" },
  { href: "/work", label: "Work" },
] as const;

/** The label on every button that opens the get-started form. */
export const CTA_LABEL = "Get started";
