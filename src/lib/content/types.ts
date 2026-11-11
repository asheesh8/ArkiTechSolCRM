import type { Faq } from "@/lib/marketing/faq";

/**
 * The shape of every content page (guides, comparisons, towns, industries,
 * case studies), so a new page is a data entry, not a new component.
 *
 * Rules every entry follows:
 * - `quickAnswer` answers the page's main question in 40-60 words.
 * - Section headings are questions people actually ask.
 * - Only real facts. Where a local detail, number or quote is needed and we
 *   don't have it, use a `todo` block; it renders in development only.
 */

/** Paragraph text may contain [label](https://link) for inline links. */
export type Block =
  | { p: string }
  | { list: string[] }
  | { table: { head: string[]; rows: string[][]; caption?: string } }
  | { sources: { href: string; label: string }[] }
  | { todo: string };

export type Section = { h2: string; blocks: Block[] };

export type Link = { href: string; label: string };

export type ContentPage = {
  slug: string;
  /** Root-relative path the page is served at. */
  path: string;
  /** <title>, 50-60 characters. */
  title: string;
  /** Meta description, 140-160 characters, written as a direct answer. */
  description: string;
  /** Small line above the title; becomes the page's H1 when set. */
  kicker?: string;
  /** The page's H1 (or display title when a kicker is the H1). */
  h1: string;
  quickAnswer: string;
  sections: Section[];
  faqs?: Faq[];
  related: Link[];
  /** ISO dates. `updated` moves only when the words change. */
  published: string;
  updated: string;
  /** Drafts: served with noindex and left out of the sitemap. */
  noindex?: boolean;
};
