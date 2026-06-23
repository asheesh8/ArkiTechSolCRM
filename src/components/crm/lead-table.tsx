"use client";

import Link from "next/link";
import { ExternalLink, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { formatStatus } from "@/lib/utils";
import { leadStatuses } from "@/lib/schemas";

type Lead = any;

export function LeadTable({ leads, onStatus }: { leads: Lead[]; onStatus?: (id: string, status: string) => void }) {
  if (!leads.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-800">
        <h3 className="font-semibold">No leads match these filters</h3>
        <p className="mt-1 text-sm text-zinc-500">Try a broader search or save leads from the scraper.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/70">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {leads.map((lead) => (
              <tr key={lead.id} className="align-middle">
                <td className="px-4 py-4">
                  <Link href={`/clients/${lead.id}`} className="font-medium hover:underline">
                    {lead.businessName}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">{lead.phone ?? "No phone"}</p>
                </td>
                <td className="px-4 py-4">
                  <span>{lead.category ?? "Uncategorized"}</span>
                  <p className="mt-1 text-xs text-zinc-500">
                    {[lead.city, lead.state].filter(Boolean).join(", ") || "No location"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  {lead.googleRating ?? "--"} <span className="text-zinc-500">({lead.googleReviewCount ?? 0})</span>
                </td>
                <td className="px-4 py-4">
                  {lead.website ? (
                    <a className="inline-flex items-center gap-1 text-zinc-700 hover:underline dark:text-zinc-200" href={lead.website} target="_blank">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-amber-600">No website</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {onStatus ? (
                    <Select defaultValue={lead.status} onChange={(event) => onStatus(lead.id, event.target.value)}>
                      {leadStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Badge value={lead.status} />
                  )}
                </td>
                <td className="px-4 py-4">{lead.assignedTo?.name ?? (lead.assignedToId === "demo-terri" ? "Terri" : "Ashish")}</td>
                <td className="px-4 py-4 text-right">
                  <Link href={`/clients/${lead.id}`}>
                    <Button variant="outline" size="sm">
                      <StickyNote className="h-4 w-4" />
                      Notes
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
