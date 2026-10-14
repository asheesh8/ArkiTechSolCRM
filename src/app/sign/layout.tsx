import type { Metadata } from "next";

// Contract signing links are private to one client each. Kept out of search even if a URL leaks.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
