import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { services } from "@/lib/services-content";
import { FooterLogo } from "./footer-logo";

const COMPANY = [
  { href: "/services", label: "All services" },
  { href: "/blog", label: "Blog" },
  { href: "/#showcase", label: "Work" },
  { href: "/#team", label: "Team" },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#08080f] px-6 pb-10 pt-20">
      <div className="pointer-events-none absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FooterLogo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/40">
              Websites, automations, and the systems behind them — built by hand in Burlington, Vermont.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Services</p>
            <ul className="mt-4 space-y-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="text-sm text-white/45 transition hover:text-white">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Company</p>
            <ul className="mt-4 space-y-2.5">
              {COMPANY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/45 transition hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Get in touch</p>
            <ul className="mt-4 space-y-3 text-sm text-white/45">
              <li className="flex items-center gap-2.5"><Clock size={15} className="shrink-0 text-violet-300" />Mon–Fri, 8am–5pm</li>
              <li><a href="tel:+18023103749" className="flex items-center gap-2.5 transition hover:text-white"><Phone size={15} className="shrink-0 text-violet-300" />(802) 310-3749</a></li>
              <li><a href="mailto:hello@arkitech-sol.com" className="flex items-center gap-2.5 transition hover:text-white"><Mail size={15} className="shrink-0 text-violet-300" />hello@arkitech-sol.com</a></li>
              <li className="flex items-center gap-2.5"><MapPin size={15} className="shrink-0 text-violet-300" />Burlington, Vermont</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row">
          <span className="text-xs text-white/25">© {new Date().getFullYear()} ArkiTech Solutions</span>
          <div className="flex gap-5">
            <Link href="/legal/privacy" className="text-xs text-white/30 transition hover:text-white">Privacy</Link>
            <Link href="/legal/terms" className="text-xs text-white/30 transition hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
