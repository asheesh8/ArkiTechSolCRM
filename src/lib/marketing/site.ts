/** Facts the whole site repeats. One place to change them. */
export const SITE = {
  name: "ArkiTech Solutions",
  phone: "(802) 310-3749",
  phoneHref: "tel:+18023103749",
  email: "hello@arkitech-sol.com",
  studio: "Burlington, Vermont",
  hours: "Mon-Fri, 8am-5pm",
  founded: "July 2026",
} as const;

export const ABOUT_LINKS = [
  { href: "/#studio", label: "The studio" },
  { href: "/#work", label: "Our work" },
  { href: "/#team", label: "The team" },
  { href: "/service-areas", label: "Service areas" },
] as const;

export const COMPANY_LINKS = [
  { href: "/services", label: "All services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/service-areas", label: "Service areas" },
  { href: "/blog", label: "Blog" },
  { href: "/#work", label: "Work" },
  { href: "/#team", label: "Team" },
] as const;
