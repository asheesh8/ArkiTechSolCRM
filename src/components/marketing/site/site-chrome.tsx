import { ContactProvider } from "@/components/marketing/site/contact-context";
import { SiteNav } from "@/components/marketing/site/site-nav";
import { SiteFooter } from "@/components/marketing/site/site-footer";
import { ContactDialog } from "@/components/marketing/site/contact-dialog";
import { CallbackWidget } from "@/components/marketing/site/callback-widget";
import { CookieNotice } from "@/components/marketing/site/cookie-notice";

/**
 * Everything public shares this frame: nav, footer, and the contact surfaces.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <ContactProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-[var(--lamp)] focus:px-4 focus:py-2 focus:text-[var(--ink)]"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <ContactDialog />
      <CallbackWidget />
      <CookieNotice />
    </ContactProvider>
  );
}
