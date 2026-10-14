import type { Metadata } from "next";

// The client portal: private to each client. Kept out of search even if a URL leaks.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
