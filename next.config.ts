import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  // Retired offers and deleted pages. Their old URLs are indexed and linked
  // from ads, so each one lands on the closest current page instead of a 404.
  async redirects() {
    return [
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
      { source: "/service-areas", destination: "/about", permanent: true },
      { source: "/service-areas/:slug", destination: "/about", permanent: true },
      { source: "/cleaningbook", destination: "/", permanent: true },
      { source: "/videodemo", destination: "/", permanent: true },
    ];
  },

  // The 3-minute VSL for meetings booked over the phone: /vsl?name=Jose greets them by name.
  // The page and video live in the sale funnel (terrijambo/arkitechwebsitesale, its /watch page),
  // so it's served from there and stays in step with any change to the video.
  async rewrites() {
    const funnel = "https://arkitechwebsitesale.vercel.app";
    return [
      { source: "/vsl", destination: `${funnel}/watch` },
      { source: "/vsl/:file(ArkiTech-VSL\\.mp4|poster\\.jpg)", destination: `${funnel}/vsl/:file` },
    ];
  },
};

export default nextConfig;
