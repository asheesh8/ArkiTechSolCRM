import type { Link } from "@/lib/content/types";
import { WORK, type Work } from "@/lib/marketing/work";

/**
 * Links between clients, towns and industries, all from the client list in
 * work.ts, so a new client shows up on its town and industry pages without
 * another edit.
 */
export const clientWork = WORK.filter((w) => w.kind === "client");

export const caseStudyPath = (w: Work) => `/work/${w.caseSlug ?? w.slug}`;

export const clientsInTown = (townSlug: string) => clientWork.filter((w) => w.townPage === townSlug);

export const clientsInIndustry = (industry: NonNullable<Work["industry"]>) => clientWork.filter((w) => w.industry === industry);

export const caseStudyLinks = (works: Work[]): Link[] =>
  works.map((w) => ({ href: caseStudyPath(w), label: `${w.name}: ${w.what.toLowerCase()}${w.where ? ` in ${w.where}` : ""}` }));
