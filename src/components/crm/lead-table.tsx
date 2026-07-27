"use client";

import Link from "next/link";
import { ChevronRight, ExternalLink, Globe2, MapPin, Phone, Star, UserCheck } from "lucide-react";
import { Select } from "@/components/ui/field";
import { cn, formatStatus } from "@/lib/utils";
import { leadStatuses } from "@/lib/schemas";

type Lead = any;
type TeamUser = { id: string; name: string; role: string };

const STAGE_COLORS: Record<string, string> = {
  NEW:            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  SAVED:          "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  CALLED:         "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  MEETING_BOOKED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  FOLLOW_UP:      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  NOT_INTERESTED: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  CLOSED:         "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

function RatingDots({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= rounded ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"}`} />
      ))}
    </span>
  );
}

export function LeadTable({
  leads,
  onStatus,
  users,
  onAssign,
  selectedIds,
  onToggleSelect,
}: {
  leads: Lead[];
  onStatus?: (id: string, status: string) => void;
  users?: TeamUser[];
  onAssign?: (id: string, assignedToId: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}) {
  const selectable = !!onToggleSelect;
  if (!leads.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <p className="font-semibold text-zinc-600 dark:text-zinc-400">No leads match these filters</p>
        <p className="mt-1 text-sm text-zinc-400">Try a broader search or save leads from the scraper.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {leads.map((lead) => {
        const hasWebsite = !!lead.website;
        const lastTouch = lead.callNotes?.[0]?.createdAt;
        const location = [lead.city, lead.state].filter(Boolean).join(", ");

        const checked = selectedIds?.has(lead.id) ?? false;

        return (
          <div
            key={lead.id}
            className={cn(
              "group relative overflow-hidden rounded-lg border bg-[var(--surface-strong)] transition hover:bg-white hover:shadow-sm dark:hover:bg-white/10",
              checked
                ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/40"
                : "border-[var(--border)]",
            )}
          >
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">

              {selectable && (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleSelect!(lead.id)}
                  aria-label={`Select ${lead.businessName}`}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[var(--accent)]"
                />
              )}

              {/* Left: business info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/clients/${lead.id}`} className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
                    {lead.businessName}
                  </Link>
                  {!hasWebsite && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                      No website
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                  {lead.category && <span>{lead.category}</span>}
                  {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
                  {lead.googleRating != null && (
                    <span className="flex items-center gap-1.5">
                      <RatingDots value={lead.googleRating} />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{lead.googleRating.toFixed(1)}</span>
                      <span className="text-zinc-400">({lead.googleReviewCount ?? 0})</span>
                    </span>
                  )}
                  {lastTouch && (
                    <span className="text-zinc-400">Last contact {new Date(lastTouch).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  )}
                </div>
              </div>

              {/* Middle: quick actions */}
              <div className="flex flex-wrap items-center gap-2">
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-white dark:text-zinc-300 dark:hover:bg-white/10"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {lead.phone}
                  </a>
                )}
                {hasWebsite && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-white dark:text-zinc-300 dark:hover:bg-white/10"
                  >
                    <Globe2 className="h-3.5 w-3.5" />
                    Website <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>

              {/* Right: assignee + status chips + view */}
              <div className="flex flex-col items-end gap-2">
                {/* Assignee */}
                {onAssign && users ? (
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                    <Select
                      value={lead.assignedTo?.id ?? ""}
                      onChange={(e) => onAssign(lead.id, e.target.value)}
                      className="h-7 w-auto min-w-32 rounded-md py-0 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </Select>
                  </label>
                ) : lead.assignedTo ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <UserCheck className="h-3.5 w-3.5 text-zinc-400" />{lead.assignedTo.name}
                  </span>
                ) : null}
                {/* Status chip row */}
                {onStatus && (
                  <div className="flex flex-wrap justify-end gap-1">
                    {leadStatuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onStatus(lead.id, s)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold transition",
                          lead.status === s
                            ? STAGE_COLORS[s]
                            : "bg-transparent text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-400",
                        )}
                      >
                        {formatStatus(s)}
                      </button>
                    ))}
                  </div>
                )}
                <Link
                  href={`/clients/${lead.id}`}
                  className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-white dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Open <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
