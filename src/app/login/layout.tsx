import type { Metadata } from "next";

// The staff sign-in page. Kept out of search even if a URL leaks.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
