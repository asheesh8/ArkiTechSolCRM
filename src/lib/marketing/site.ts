/** Facts the whole site repeats. One place to change them. */
export const SITE = {
  name: "ArkiTech Solutions",
  legalName: "ArkiTech Solutions LLC",
  phone: "(802) 557-8828",
  phoneHref: "tel:+18025578828",
  email: "studio@sol-arkitech.com",
  studio: "Burlington, Vermont",
  hours: "Mon-Fri, 8am-7pm",
  /** Where clients can be. The studio is in Burlington; the work is remote. */
  reach: "Remote, anywhere in the US",
  founded: "July 2026",
} as const;

/** Pages every visitor might want, beyond the three services. Nav and footer share it. */
export const PAGE_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
] as const;

/** The label on every button that opens the get-started form. */
export const CTA_LABEL = "Get started";
