"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { unzipSync } from "fflate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { DEMO_BRIEFS, UNIVERSAL_REQUIREMENTS, PAGESPEED_FLOOR, getBrief } from "@/lib/demo-briefs";

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
  const [draft, setDraft] = useState({ title: "", businessType: DEMO_BRIEFS[0].key });

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

  async function create() {
    if (!draft.title.trim()) return say("Give the demo a name first.", true);
    setBusy(true);
    const res = await fetch("/api/demos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await readJson(res);
    setBusy(false);
    if (!res.ok) return say(String(data.error ?? "Couldn't start that build."), true);
    setDraft({ title: "", businessType: DEMO_BRIEFS[0].key });
    say("Build started. Attach the codebase and a preview link when you're ready.");
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

      {/* --------------------------------------------------------- the briefs */}
      <Card>
        <CardHeader>
          <CardTitle>Briefs by business type</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Pick the one you&apos;re building against and keep it open while you work.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_BRIEFS.map((brief) => {
            const open = openBrief === brief.key;
            return (
              <div key={brief.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <button
                  type="button"
                  onClick={() => setOpenBrief(open ? null : brief.key)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span>
                    <span className="text-sm font-semibold">{brief.label}</span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{brief.audience}</span>
                  </span>
                  <span className="text-xs text-zinc-500">{open ? "Hide" : "Open"}</span>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-[var(--border)] p-4 text-sm">
                    <p className="text-zinc-400">
                      <span className="font-semibold text-zinc-300">The angle: </span>
                      {brief.angle}
                    </p>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Must have</p>
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
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Avoid</p>
                      <ul className="space-y-1.5">
                        {brief.avoid.map((a) => (
                          <li key={a} className="flex gap-2 text-zinc-400">
                            <span className="text-red-500">✕</span>
                            {a}
                          </li>
                        ))}
                      </ul>
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
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------- new build */}
      <Card>
          <CardHeader>
            <CardTitle>Start a build</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-[1fr_240px_auto] sm:items-end">
              <div>
                <Label htmlFor="demo-title">Name</Label>
                <Input
                  id="demo-title"
                  className="mt-1.5"
                  value={draft.title}
                  placeholder="Sparkle Cleaning demo"
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="demo-type">Business type</Label>
                <Select
                  id="demo-type"
                  className="mt-1.5"
                  value={draft.businessType}
                  onChange={(e) => setDraft((d) => ({ ...d, businessType: e.target.value }))}
                >
                  {DEMO_BRIEFS.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="button" onClick={create} disabled={busy}>
                Start
              </Button>
          </div>
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
