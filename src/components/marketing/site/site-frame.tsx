import { Libre_Caslon_Display, Libre_Caslon_Text, Schibsted_Grotesk, DM_Mono } from "next/font/google";
import { SiteChrome } from "@/components/marketing/site/site-chrome";
import "./site.css";

// The wordmark is a light, high-contrast Caslon. Of twenty open serifs set
// against the supplied artwork, Libre Caslon Display matched it closest.
const caslonDisplay = Libre_Caslon_Display({ variable: "--font-caslon", subsets: ["latin"], weight: "400", display: "swap" });
// The display cut has no italic; the text cut's italic carries emphasis.
const caslonText = Libre_Caslon_Text({
  variable: "--font-caslon-text",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});
// Body and interface.
const schibsted = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"], display: "swap" });
// "Solutions" in the logo; used only for the lockup and map labels.
const dmMono = DM_Mono({ variable: "--font-dm-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// Day / Night, written to <html> before the page paints so a Night visitor
// never sees a flash of Day. Follows the OS until someone picks.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("ark-theme");if(t!=="day"&&t!=="night"){t=matchMedia("(prefers-color-scheme: dark)").matches?"night":"day"}document.documentElement.setAttribute("data-ark-theme",t)}catch(e){document.documentElement.setAttribute("data-ark-theme","day")}})()`;

/**
 * Everything public renders inside this: the site's fonts and stylesheet, the
 * theme, and the shared chrome. The CRM's own pages never load any of it.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ark ${caslonDisplay.variable} ${caslonText.variable} ${schibsted.variable} ${dmMono.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <SiteChrome>{children}</SiteChrome>
    </div>
  );
}
