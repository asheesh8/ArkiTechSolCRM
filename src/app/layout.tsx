import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Archivo, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";

// Geist is the CRM's typeface and is not used anywhere on the public site.
// It still has to be declared here because the root layout is shared, but
// `preload: false` stops every marketing page from issuing preload hints for
// two families it never renders.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// The marketing site's typography. Archivo carries a `wdth` axis, and the
// condensed end of it is what gives the display headings their editorial
// weight — without it the whole system reads like stock Helvetica.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Every small label on the public site is set in this: eyebrows, buttons, nav,
// figures. It is the single loudest signal that a studio, not a template,
// built the page.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArkiTech Solutions",
  description: "Websites, platforms, automations, and digital systems for growing teams and established organizations.",
};

// viewport-fit=cover lets the CRM shell paint under the notch and home
// indicator; the safe-area utilities in globals.css pad it back out.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080b10" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
