import { GuidePage } from "@/components/marketing/templates/guide-page";
import type { ContentPage } from "@/lib/content/types";

export type ComparePageData = ContentPage & {
  /**
   * When the competitor facts were last checked (ISO date). Comparisons only
   * state what each provider publishes, with a source link for every claim,
   * and never disparage anyone.
   */
  checkedOn?: string;
};

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A guide with a "checked on" line for the facts it compares. */
export function ComparePage({ page }: { page: ComparePageData }) {
  return (
    <GuidePage page={page} parent={{ name: "Blog", path: "/blog" }} about={page.h1}>
      {page.checkedOn ? (
        <p className="text-sm text-[var(--dim)]">
          Prices and plan details for other providers checked on {longDate(page.checkedOn)}, from each provider&rsquo;s own published pages.
        </p>
      ) : null}
    </GuidePage>
  );
}
