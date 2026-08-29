"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { unzipSync } from "fflate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { DEMO_BRIEFS, UNIVERSAL_REQUIREMENTS, PAGESPEED_FLOOR, getBrief } from "@/lib/demo-briefs";
import { RESOURCE_GROUPS } from "@/lib/demo-resources";
import { DemoPromptBuilder } from "@/components/crm/demo-prompt-builder";

/**
 * The developers' room: the briefs on one side, your builds on the other.
 *
 * The gallery is not decoration. An outside developer producing work that looks
 * like ours is a function of starting from a written standard, so the brief for
 * whichever business type they picked stays on screen while they work rather
 * than being something they read once and closed.
 */

type Demo = {
  id: string;
  title: string;
  businessType: string;
  status: string;
  previewUrl: string | null;
  zipKey: string | null;
  zipName: string | null;
  zipSize: string | null;
  notes: string | null;
  ownerNote: string | null;
  mobileScore: number | null;
  desktopScore: number | null;
  repoUrl: string | null;
  deployUrl: string | null;
  developer: { id: string; name: string; email: string };
  updatedAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-zinc-500/15 text-zinc-400",
  SUBMITTED: "bg-amber-500/15 text-amber-500",
  CHANGES_REQUESTED: "bg-red-500/15 text-red-500",
  APPROVED: "bg-emerald-500/15 text-emerald-500",
  SHIPPED: "bg-violet-500/15 text-violet-400",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "In review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  SHIPPED: "Shipped",
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Look inside the zip before uploading a byte of it.
 *
 * A project folder zipped from Finder includes node_modules, which turns a 3MB
 * upload into something in the hundreds of megabytes. Catching it in the
 * browser means the developer finds out in a second rather than after a long
 * upload and a server-side rejection.
 */
async function inspectZip(file: File): Promise<{ ok: true; files: number } | { ok: false; reason: string }> {
  try {
    const entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
    const paths = Object.keys(entries);
    const offenders = paths.filter((p) => /(^|\/)(node_modules|\.next)\//.test(p));
    if (offenders.length > 0) {
      const which = offenders[0].includes("node_modules") ? "node_modules" : ".next";
      return {
        ok: false,
        reason: `This zip contains ${which} (${offenders.length} files). Delete it and re-zip — it is not part of the codebase and it will not be committed.`,
      };
    }
    if (!paths.some((p) => /(^|\/)package\.json$/.test(p))) {
      return { ok: false, reason: "No package.json found in this zip. Zip the project folder itself." };
    }
    return { ok: true, files: paths.filter((p) => !p.endsWith("/")).length };
  } catch {
    return { ok: false, reason: "That file could not be read as a zip." };
  }
}

export function DemoWorkspace({ viewerRole, viewerId }: { viewerRole: string; viewerId: string }) {
  const [demos, setDemos] = useState<Demo[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openBrief, setOpenBrief] = useState<string | null>(null);
  const [openShelf, setOpenShelf] = useState<string | null>(null);

  const isOwner = viewerRole === "OWNER";

  async function readJson(res: Response) {
    return (await res.json().catch(() => ({}))) as Record<string, unknown>;
  }
  function say(text: string, isError = false) {
    setMessage(text);
    setError(isError);
  }

  async function load() {
    const res = await fetch("/api/demos");
    const data = await readJson(res);
    if (!res.ok) {
      say(String(data.error ?? `Couldn't load builds (${res.status}).`), true);
      setDemos([]);
      return;
    }
    setDemos(data.demos as Demo[]);
  }

  useEffect(() => {
    load().catch(() => say("Couldn't load builds.", true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createBuild(
    nextDraft: { title: string; businessType: string },
    brief?: string,
  ) {
    if (!nextDraft.title.trim()) {
      say("Give the build a name first.", true);
      return;
    }
    setBusy(true);
    const res = await fetch("/api/demos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextDraft),
    });
    const data = await readJson(res);
    if (!res.ok) {
      setBusy(false);
      say(String(data.error ?? "Couldn't start that build."), true);
      return;
    }

    const demo = data.demo as { id?: string } | undefined;
    if (brief && demo?.id) {
      const saveBrief = await fetch(`/api/demos/${demo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: brief }),
      });
      if (!saveBrief.ok) {
        setBusy(false);
        say("The build was created, but the prepared brief could not be attached. Copy it before continuing.", true);
        load();
        return;
      }
    }

    setBusy(false);
    say(brief ? "Build created with its source-backed brief attached." : "Build started. Attach the codebase and a preview link when you're ready.");
    load();
  }

  async function patch(id: string, body: Record<string, unknown>, done?: string) {
    const res = await fetch(`/api/demos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await readJson(res);
    if (!res.ok) {
      say(String(data.error ?? "Couldn't save that."), true);
      return false;
    }
    if (done) say(done);
    load();
    return true;
  }

  async function upload(demo: Demo, file: File) {
    setBusy(true);
    say(`Checking ${file.name}…`);

    const check = await inspectZip(file);
    if (!check.ok) {
      setBusy(false);
      return say(check.reason, true);
    }

    say(`Uploading ${file.name} (${check.files} files)…`);
    const ticket = await fetch(`/api/demos/${demo.id}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, size: file.size }),
    });
    const ticketData = await readJson(ticket);
    if (!ticket.ok) {
      setBusy(false);
      return say(String(ticketData.error ?? "Couldn't start the upload."), true);
    }

    // Straight to R2. This never touches our server, which is the only reason
    // a codebase-sized file can be uploaded at all.
    const put = await fetch(String(ticketData.uploadUrl), {
      method: "PUT",
      headers: { "Content-Type": "application/zip" },
      body: file,
    }).catch(() => null);

    if (!put || !put.ok) {
      setBusy(false);
      return say("The upload didn't complete. Check your connection and try again.", true);
    }

    await patch(
      demo.id,
      { zipKey: ticketData.key, zipName: file.name, zipSize: file.size },
      `${file.name} attached.`,
    );
    setBusy(false);
  }

  async function act(id: string, path: string, body?: Record<string, unknown>, done?: string) {
    setBusy(true);
    const res = await fetch(`/api/demos/${id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await readJson(res);
    setBusy(false);
    if (!res.ok) return say(String(data.error ?? `That didn't work (${res.status}).`), true);
    const warning = data.scoreWarning ?? data.deployWarning;
    say(warning ? `${done ?? "Done."} ${warning}` : (done ?? "Done."));
    load();
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------ the standard */}
      <Card>
        <CardHeader>
          <CardTitle>What a demo has to be</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            These apply to every build, whatever the business. The PageSpeed number is the one that is
            enforced — a build under {PAGESPEED_FLOOR} on mobile can&apos;t be submitted, because that is what
            the public site guarantees.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {UNIVERSAL_REQUIREMENTS.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-zinc-400">
                <span className="text-violet-400">—</span>
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------- project prep */}
      <Card>
        <CardHeader>
          <CardTitle>Project prep</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Inspect the client&apos;s current site, choose a proven repository reference, confirm three project
            decisions, and hand the developer a complete design and engineering brief.
          </p>
        </CardHeader>
        <CardContent>
          <DemoPromptBuilder onCreateBuild={(input) => createBuild(input, input.brief)} />
        </CardContent>
      </Card>

      {/* --------------------------------------------------------- the briefs */}
      <Card>
        <CardHeader>
          <CardTitle>The briefs in full</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Tap one to read what it must contain and the failures that recur in that category. Keep it open
            while you work.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_BRIEFS.map((brief) => {
              const open = openBrief === brief.key;
              return (
                <button
                  key={brief.key}
                  type="button"
                  onClick={() => setOpenBrief(open ? null : brief.key)}
                  aria-expanded={open}
                  className="group relative aspect-square overflow-hidden rounded-2xl border text-left transition focus:outline-none"
                  style={{ borderColor: open ? "var(--accent)" : "var(--border)" }}
                >
                  <Image
                    src={brief.cover}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    style={{ filter: "brightness(1.45) contrast(1.02) saturate(0.92)" }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background: open
                        ? "linear-gradient(to top, rgba(8,8,11,0.93) 0%, rgba(8,8,11,0.72) 60%, rgba(8,8,11,0.45) 100%)"
                        : "linear-gradient(to top, rgba(8,8,11,0.90) 0%, rgba(8,8,11,0.55) 42%, rgba(8,8,11,0.10) 100%)",
                    }}
                  />
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="block text-sm font-semibold text-white">{brief.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/60">
                      {open ? brief.audience : brief.angle}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {openBrief ? (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              {(() => {
                const brief = getBrief(openBrief);
                if (!brief) return null;
                return (
                  <div className="space-y-4">
                    <p className="text-zinc-400">
                      <span className="font-semibold text-zinc-300">The angle: </span>
                      {brief.angle}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Must have
                        </p>
                        <ul className="space-y-1.5">
                          {brief.mustHave.map((m) => (
                            <li key={m} className="flex gap-2 text-zinc-400">
                              <span className="text-emerald-500">✓</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Avoid
                        </p>
                        <ul className="space-y-1.5">
                          {brief.avoid.map((a) => (
                            <li key={a} className="flex gap-2 text-zinc-400">
                              <span className="text-red-500">✕</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {brief.reference ? (
                      <Link
                        href={brief.reference.href}
                        target="_blank"
                        className="inline-block text-xs text-violet-400 underline"
                      >
                        Reference build: {brief.reference.label} →
                      </Link>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- shelf */}
      <Card>
        <CardHeader>
          <CardTitle>The shelf</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Where to go instead of reaching for the default. The usual failure isn&apos;t a broken build — it&apos;s a
            correct one nobody remembers: stock button, default indigo, Inter at three weights. Start with type
            and buttons; they carry most of the difference.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {RESOURCE_GROUPS.map((group) => {
            const open = openShelf === group.key;
            return (
              <div key={group.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <button
                  type="button"
                  onClick={() => setOpenShelf(open ? null : group.key)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span>
                    <span className="text-sm font-semibold">{group.label}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{group.blurb}</span>
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {open ? "Hide" : `${group.items.length} links`}
                  </span>
                </button>
                {open ? (
                  <ul className="space-y-3 border-t border-[var(--border)] p-4">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm font-medium text-violet-400 underline underline-offset-2"
                        >
                          {item.label} ↗
                        </a>
                        <p className="mt-0.5 text-xs leading-5 text-zinc-500">{item.note}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- builds */}
      <Card>
        <CardHeader>
          <CardTitle>{isOwner ? "All builds" : "Your builds"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {demos == null ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : demos.length === 0 ? (
            <p className="text-sm text-zinc-500">Nothing here yet. Start a build above.</p>
          ) : (
            demos.map((demo) => (
              <DemoRow
                key={demo.id}
                demo={demo}
                isOwner={isOwner}
                isMine={demo.developer.id === viewerId}
                busy={busy}
                onPatch={patch}
                onUpload={upload}
                onAct={act}
              />
            ))
          )}
        </CardContent>
      </Card>

      {message ? (
        <p
          className={`text-sm ${error ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function DemoRow({
  demo,
  isOwner,
  isMine,
  busy,
  onPatch,
  onUpload,
  onAct,
}: {
  demo: Demo;
  isOwner: boolean;
  isMine: boolean;
  busy: boolean;
  onPatch: (id: string, body: Record<string, unknown>, done?: string) => Promise<boolean>;
  onUpload: (demo: Demo, file: File) => Promise<void>;
  onAct: (id: string, path: string, body?: Record<string, unknown>, done?: string) => Promise<void>;
}) {
  const [preview, setPreview] = useState(demo.previewUrl ?? "");
  const [feedback, setFeedback] = useState("");
  const [briefCopied, setBriefCopied] = useState(false);
  const brief = getBrief(demo.businessType);
  const locked = demo.status === "APPROVED" || demo.status === "SHIPPED";
  const editable = !locked && (isMine || isOwner);

  return (
    <details className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
        <span>{demo.title}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] ${STATUS_STYLE[demo.status] ?? ""}`}>
          {STATUS_LABEL[demo.status] ?? demo.status}
        </span>
        <span className="font-mono text-xs font-normal text-zinc-500">{brief?.label ?? demo.businessType}</span>
        {demo.mobileScore != null ? (
          <span
            className={`font-mono text-xs font-normal ${demo.mobileScore >= PAGESPEED_FLOOR ? "text-emerald-500" : "text-red-500"}`}
          >
            {demo.mobileScore} mobile
          </span>
        ) : null}
        {isOwner ? <span className="text-xs font-normal text-zinc-500">{demo.developer.name}</span> : null}
      </summary>

      <div className="mt-4 space-y-4">
        {demo.ownerNote ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Review note: </span>
            {demo.ownerNote}
          </div>
        ) : null}

        {demo.notes ? (
          <details className="rounded-lg border border-[var(--border)] bg-black/10">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-zinc-400">
              Prepared project brief
            </summary>
            <div className="border-t border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-500">Source-backed design and engineering specification</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(demo.notes ?? "");
                    setBriefCopied(true);
                    window.setTimeout(() => setBriefCopied(false), 1600);
                  }}
                >
                  {briefCopied ? "Copied" : "Copy brief"}
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-black/20 p-3 font-mono text-[11px] leading-5 text-zinc-400">
                {demo.notes}
              </pre>
            </div>
          </details>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`preview-${demo.id}`}>Live preview URL</Label>
            <Input
              id={`preview-${demo.id}`}
              className="mt-1.5"
              placeholder="https://…"
              value={preview}
              disabled={!editable}
              onChange={(e) => setPreview(e.target.value)}
              onBlur={() => {
                if (preview !== (demo.previewUrl ?? "")) {
                  onPatch(demo.id, { previewUrl: preview.trim() || null }, "Preview link saved.");
                }
              }}
            />
            <p className="mt-1 text-xs text-zinc-500">Where it&apos;s running now. This is what gets scored.</p>
          </div>

          <div>
            <Label htmlFor={`zip-${demo.id}`}>Codebase</Label>
            {demo.zipName ? (
              <p className="mt-2 text-sm text-zinc-400">
                {demo.zipName}
                {demo.zipSize ? (
                  <span className="text-zinc-500"> · {formatSize(Number(demo.zipSize))}</span>
                ) : null}
              </p>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">Nothing attached yet.</p>
            )}
            {editable ? (
              <input
                id={`zip-${demo.id}`}
                type="file"
                accept=".zip"
                disabled={busy}
                className="mt-2 block w-full text-xs text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-xs file:text-white"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(demo, file);
                  e.target.value = "";
                }}
              />
            ) : null}
            <p className="mt-1 text-xs text-zinc-500">
              Zip the project folder. Delete node_modules first — it&apos;s checked before upload.
            </p>
          </div>
        </div>

        {demo.repoUrl || demo.deployUrl ? (
          <div className="flex flex-wrap gap-4 text-xs">
            {demo.repoUrl ? (
              <a href={demo.repoUrl} target="_blank" rel="noreferrer" className="text-violet-400 underline">
                Repository →
              </a>
            ) : null}
            {demo.deployUrl ? (
              <a href={demo.deployUrl} target="_blank" rel="noreferrer" className="text-violet-400 underline">
                Live deploy →
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {editable && (demo.status === "DRAFT" || demo.status === "CHANGES_REQUESTED") ? (
            <Button type="button" disabled={busy} onClick={() => onAct(demo.id, "submit", undefined, "Submitted for review.")}>
              Submit for review
            </Button>
          ) : null}

          {isOwner && demo.status === "SUBMITTED" ? (
            <>
              <Button
                type="button"
                disabled={busy}
                onClick={() => onAct(demo.id, "review", { action: "approve" }, "Approved.")}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  onAct(demo.id, "review", { action: "request-changes", ownerNote: feedback }, "Sent back.")
                }
              >
                Request changes
              </Button>
            </>
          ) : null}

          {isOwner && demo.status === "APPROVED" ? (
            <Button
              type="button"
              disabled={busy}
              onClick={() => onAct(demo.id, "ship", undefined, "Shipped.")}
            >
              Create repo &amp; deploy
            </Button>
          ) : null}
        </div>

        {isOwner && demo.status === "SUBMITTED" ? (
          <div>
            <Label htmlFor={`note-${demo.id}`}>Why it&apos;s going back</Label>
            <Textarea
              id={`note-${demo.id}`}
              className="mt-1.5 min-h-20"
              placeholder="Required if you're requesting changes."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        ) : null}
      </div>
    </details>
  );
}
