import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  // Retired offers and deleted pages. Their old URLs are indexed and linked
  // from ads, so each one lands on the closest current page instead of a 404.
  async redirects() {
    return [
      // One canonical host. Vercel's domain settings may already answer www
      // with a 307 before this runs; this makes it permanent wherever it's
      // the code that answers.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.arkitech-sol.com" }],
        destination: "https://arkitech-sol.com/:path*",
        permanent: true,
      },
      { source: "/services/growth-partnership", destination: "/pricing", permanent: true },
      { source: "/services/brand-seo", destination: "/pricing", permanent: true },
      { source: "/services/crm-portals", destination: "/services/dashboards", permanent: true },
      { source: "/services/automations", destination: "/services", permanent: true },
      { source: "/services/ai-receptionist", destination: "/services", permanent: true },
      { source: "/blog/the-day-three-problem", destination: "/blog", permanent: true },
      { source: "/blog/what-a-missed-call-costs", destination: "/blog", permanent: true },
      { source: "/ArkiTech-Solutions-Pricing-Guide.pdf", destination: "/pricing", permanent: true },
      // Pages folded into others or deleted outright.
      { source: "/contact", destination: "/about", permanent: true },
      { source: "/cleaningbook", destination: "/", permanent: true },
      { source: "/videodemo", destination: "/", permanent: true },
    ];
  },

};

export default nextConfig;
