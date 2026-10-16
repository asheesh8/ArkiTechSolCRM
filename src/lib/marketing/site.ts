/** Facts the whole site repeats. One place to change them. */
export const SITE = {
  name: "ArkiTech Solutions",
  legalName: "ArkiTech Solutions LLC",
  phone: "(802) 557-8828",
  phoneHref: "tel:+18025578828",
  email: "studio@sol-arkitech.com",
  studio: "Burlington, Vermont",
  hours: "Mon-Fri, 8am-5pm",
  founded: "July 2026",
} as const;

export const ABOUT_LINKS = [
  { href: "/about", label: "The studio" },
  { href: "/work", label: "Our work" },
  { href: "/about#team", label: "The team" },
  { href: "/service-areas", label: "Service areas" },
  { href: "/contact", label: "Contact" },
] as const;

export const COMPANY_LINKS = [
  { href: "/services", label: "All services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/service-areas", label: "Service areas" },
  { href: "/blog", label: "Blog" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
