import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Libre_Caslon_Display, DM_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const ui = Schibsted_Grotesk({ variable: "--font-ui", subsets: ["latin"], display: "swap" });
const display = Libre_Caslon_Display({ variable: "--font-display", subsets: ["latin"], weight: "400", display: "swap" });
const mono = DM_Mono({ variable: "--font-mono-face", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "ArkiTech Portal", template: "%s · ArkiTech Portal" },
  description: "Your business, run by ArkiTech Solutions.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const theme = jar.get("theme")?.value;
  const dataTheme = theme === "dark" ? "dark" : theme === "light" ? "light" : undefined;
  return (
    <html lang="en" data-theme={dataTheme} className={`${ui.variable} ${display.variable} ${mono.variable} h-full`} suppressHydrationWarning>
      <head>
        {dataTheme ? null : (
          // Follow the system until the person picks; done inline so there is no flash.
          <script
            dangerouslySetInnerHTML={{
              __html: `try{if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark'}catch(e){}`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
