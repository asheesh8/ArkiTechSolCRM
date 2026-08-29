"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, CheckCircle2, Copy, ExternalLink, GitBranch, Globe2, ImageIcon, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { DEMO_BRIEFS, getBrief } from "@/lib/demo-briefs";
import { EMPTY_ANSWERS, buildPrompt, missingFor, type PromptAnswers } from "@/lib/demo-prompt";

type ReferenceRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  cloneUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  private: boolean;
  updatedAt: string;
};

type SiteIntake = {
  url: string;
  businessName: string;
  description: string;
  town: string;
  phone: string;
  email: string;
  primaryAction: string;
  palette: string;
  headings: string[];
  images: { logo: string | null; cover: string | null; photos: string[] };
};

const DIRECTION_BY_TYPE: Record<string, string> = {
  cleaning: "Trustworthy, orderly, crisp",
  trades: "Direct, capable, urgent",
  professional: "Credible, restrained, precise",
  restaurant: "Appetizing, local, energetic",
  fitness: "Motivating, human, confident",
};

function inferBusinessType(intake: SiteIntake) {
  const text = `${intake.businessName} ${intake.description} ${intake.headings.join(" ")}`.toLowerCase();
  if (/clean|maid|janitor|housekeep/.test(text)) return "cleaning";
  if (/restaurant|cafe|coffee|bar|menu|dining|hotel|hospitality/.test(text)) return "restaurant";
  if (/gym|fitness|yoga|wellness|trainer|therapy|clinic/.test(text)) return "fitness";
  if (/plumb|electric|hvac|roof|contractor|repair|construction|landscap/.test(text)) return "trades";
  return "professional";
}

function mergeIntake(intake: SiteIntake): PromptAnswers {
  const businessType = inferBusinessType(intake);
  const brief = getBrief(businessType);
  const evidence = [
    intake.phone ? `Phone: ${intake.phone}` : "",
    intake.email ? `Email: ${intake.email}` : "",
    intake.headings.length ? `Source headings: ${intake.headings.slice(0, 6).join(" | ")}` : "",
    intake.images.logo ? `Logo asset: ${intake.images.logo}` : "",
    intake.images.cover ? `Cover asset: ${intake.images.cover}` : "",
    intake.images.photos.length ? `Photo assets:\n${intake.images.photos.map((photo) => `- ${photo}`).join("\n")}` : "",
  ].filter(Boolean).join("\n");
  return {
    ...EMPTY_ANSWERS,
    businessType,
    businessName: intake.businessName,
    town: intake.town,
    whatTheyDo: intake.description,
    customer: brief?.audience ?? "",
    primaryAction: intake.primaryAction,
    personality: DIRECTION_BY_TYPE[businessType] ?? "",
    palette: intake.palette,
    reference: intake.url,
    specifics: evidence,
  };
}

export function DemoPromptBuilder({
  onCreateBuild,
}: {
  onCreateBuild?: (input: { title: string; businessType: string; brief: string }) => Promise<void>;
}) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [answers, setAnswers] = useState<PromptAnswers>(EMPTY_ANSWERS);
  const [intake, setIntake] = useState<SiteIntake | null>(null);
  const [repos, setRepos] = useState<ReferenceRepo[] | null>(null);
  const [repoOwner, setRepoOwner] = useState("ashishsubedi");
  const [repoQuery, setRepoQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cloneCopied, setCloneCopied] = useState<number | null>(null);
  const [startingBuild, setStartingBuild] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/demos/repositories")
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(String(payload.error ?? "Repository shelf unavailable."));
        if (!cancelled) {
          setRepos(payload.repos as ReferenceRepo[]);
          setRepoOwner(String(payload.owner ?? "ashishsubedi"));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRepos([]);
          setRepoError(error instanceof Error ? error.message : "Repository shelf unavailable.");
        }
      });
    return () => { cancelled = true; };
  }, []);

  const set = (name: keyof PromptAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [name]: value }));
    setCopied(false);
  };

  const missing = useMemo(() => missingFor(answers), [answers]);
  const ready = Boolean(answers.businessType) && missing.length === 0;
  const briefText = useMemo(() => ready ? buildPrompt(answers) : "", [answers, ready]);
  const filteredRepos = useMemo(() => {
    const query = repoQuery.trim().toLowerCase();
    if (!query) return repos?.slice(0, 12) ?? [];
    return (repos ?? []).filter((repo) =>
      [repo.name, repo.fullName, repo.description ?? "", repo.language ?? "", ...repo.topics]
        .join(" ")
        .toLowerCase()
        .includes(query),
    ).slice(0, 18);
  }, [repoQuery, repos]);
  const sourceImages = intake
    ? [intake.images.logo, intake.images.cover, ...intake.images.photos].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index).slice(0, 8)
    : [];

  async function analyzeWebsite() {
    if (!websiteUrl.trim()) {
      setIntakeError("Enter the client's current website first.");
      return;
    }
    setAnalyzing(true);
    setIntakeError(null);
    try {
      const response = await fetch("/api/demos/site-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(payload.error ?? "The site could not be inspected."));
      const next = payload.intake as SiteIntake;
      setIntake(next);
      setWebsiteUrl(next.url);
      setAnswers(mergeIntake(next));
    } catch (error) {
      setIntakeError(error instanceof Error ? error.message : "The site could not be inspected.");
    } finally {
      setAnalyzing(false);
    }
  }

  function chooseRepo(repo: ReferenceRepo) {
    setSelectedRepo(repo.fullName);
    set("reference", repo.htmlUrl);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-2"><Globe2 size={18} /></span>
          <div>
            <h3 className="text-sm font-semibold">1. Inspect the existing site</h3>
            <p className="mt-1 text-xs leading-5 text-zinc-500">One URL collects the business identity, messaging clues, brand colors, contact details, and usable image references.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input aria-label="Client website URL" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") analyzeWebsite(); }} placeholder="https://clientwebsite.com" />
          <Button type="button" onClick={analyzeWebsite} disabled={analyzing} className="shrink-0">
            {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            {analyzing ? "Inspecting" : "Inspect site"}
          </Button>
        </div>
        {intakeError ? <p className="mt-2 text-xs text-red-500">{intakeError}</p> : null}
        {intake ? (
          <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={14} />Source captured</span>
              <span className="text-zinc-500">{intake.headings.length} content signals</span>
              <span className="text-zinc-500">{sourceImages.length} image references</span>
              {intake.palette ? <span className="text-zinc-500">brand colors detected</span> : null}
            </div>
            {sourceImages.length ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {sourceImages.map((src) => (
                  <Image key={src} src={src} alt="Source asset" width={112} height={72} unoptimized className="h-16 w-24 shrink-0 rounded-md border border-[var(--border)] bg-white object-cover" />
                ))}
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><ImageIcon size={14} />No reusable image references were exposed by this page.</p>
            )}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <h3 className="text-sm font-semibold">2. Confirm the project brief</h3>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Only three decisions block the brief. Everything else is editable detail, not another step.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="prep-business-type">Business type</Label>
            <Select id="prep-business-type" className="mt-1.5" value={answers.businessType} onChange={(event) => set("businessType", event.target.value)}>
              <option value="">Select a type</option>
              {DEMO_BRIEFS.map((brief) => <option key={brief.key} value={brief.key}>{brief.label}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="prep-business-name">Business name *</Label>
            <Input id="prep-business-name" className="mt-1.5" value={answers.businessName} onChange={(event) => set("businessName", event.target.value)} placeholder="Business name" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="prep-description">What they do *</Label>
            <Textarea id="prep-description" className="mt-1.5 min-h-20" value={answers.whatTheyDo} onChange={(event) => set("whatTheyDo", event.target.value)} placeholder="Specific services, offer, and differentiators" />
          </div>
          <div>
            <Label htmlFor="prep-action">Primary action *</Label>
            <Input id="prep-action" className="mt-1.5" value={answers.primaryAction} onChange={(event) => set("primaryAction", event.target.value)} placeholder="Request a quote" />
          </div>
          <div>
            <Label htmlFor="prep-town">Location</Label>
            <Input id="prep-town" className="mt-1.5" value={answers.town} onChange={(event) => set("town", event.target.value)} placeholder="Burlington, VT" />
          </div>
        </div>
        <details className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)]">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Fine-tune design direction <span className="ml-1 text-xs font-normal text-zinc-500">optional</span></summary>
          <div className="grid gap-4 border-t border-[var(--border)] p-4 sm:grid-cols-2">
            <div><Label htmlFor="prep-personality">Visual character</Label><Input id="prep-personality" className="mt-1.5" value={answers.personality} onChange={(event) => set("personality", event.target.value)} placeholder="Credible, restrained, precise" /></div>
            <div><Label htmlFor="prep-palette">Brand palette</Label><Input id="prep-palette" className="mt-1.5" value={answers.palette} onChange={(event) => set("palette", event.target.value)} placeholder="#14120F, #F7F4EF, #6B2028" /></div>
            <div><Label htmlFor="prep-heading-font">Heading typeface</Label><Input id="prep-heading-font" className="mt-1.5" value={answers.headingFont} onChange={(event) => set("headingFont", event.target.value)} placeholder="Let the designer choose" /></div>
            <div><Label htmlFor="prep-body-font">Body typeface</Label><Input id="prep-body-font" className="mt-1.5" value={answers.bodyFont} onChange={(event) => set("bodyFont", event.target.value)} placeholder="Let the designer choose" /></div>
            <div className="sm:col-span-2"><Label htmlFor="prep-specifics">Source notes</Label><Textarea id="prep-specifics" className="mt-1.5" value={answers.specifics} onChange={(event) => set("specifics", event.target.value)} placeholder="Facts, constraints, or details the build must preserve" /></div>
          </div>
        </details>
        {missing.length ? <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">Still needed: {missing.map((item) => item.label).join(", ")}</p> : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-2"><GitBranch size={18} /></span>
            <div><h3 className="text-sm font-semibold">3. Choose an implementation reference</h3><p className="mt-1 text-xs leading-5 text-zinc-500">Search {repoOwner}&apos;s approved repository shelf. Use a project for structure and craft, never for blind copying.</p></div>
          </div>
          <div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} /><Input aria-label="Search repositories" className="pl-9" value={repoQuery} onChange={(event) => setRepoQuery(event.target.value)} placeholder="Search stack or project" /></div>
        </div>
        {repoError ? <p className="mt-3 text-xs text-red-500">{repoError}</p> : null}
        {repos == null ? <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><Loader2 className="animate-spin" size={14} />Loading repository shelf</p> : null}
        {repos != null ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filteredRepos.map((repo) => {
              const selected = selectedRepo === repo.fullName;
              return (
                <article key={repo.id} className="rounded-lg border p-4" style={{ borderColor: selected ? "var(--accent)" : "var(--border)", background: selected ? "color-mix(in srgb, var(--accent) 8%, var(--surface-strong))" : "var(--surface-strong)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{repo.name}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{repo.description || "Repository reference"}</p></div>
                    <span className="shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">{repo.private ? "Private" : "Public"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-zinc-500">{repo.language ? <span>{repo.language}</span> : null}{repo.topics.slice(0, 3).map((topic) => <span key={topic}>#{topic}</span>)}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant={selected ? "default" : "outline"} onClick={() => chooseRepo(repo)}>{selected ? <Check size={14} /> : null}{selected ? "Selected" : "Use as reference"}</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(`git clone ${repo.cloneUrl}`).then(() => setCloneCopied(repo.id))}><Copy size={14} />{cloneCopied === repo.id ? "Copied" : "Clone command"}</Button>
                    <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 text-xs font-semibold text-violet-400">Open <ExternalLink size={12} /></a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4 sm:p-5">
          <div><h3 className="text-sm font-semibold">Developer build brief</h3><p className="mt-1 text-xs leading-5 text-zinc-500">A complete design and engineering specification, ready for the developer&apos;s coding workspace.</p></div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={!ready} onClick={() => navigator.clipboard.writeText(briefText).then(() => setCopied(true))}><Copy size={16} />{copied ? "Brief copied" : "Copy build brief"}</Button>
            {onCreateBuild ? (
              <Button
                type="button"
                disabled={!ready || startingBuild}
                onClick={async () => {
                  setStartingBuild(true);
                  try {
                    await onCreateBuild({
                      title: `${answers.businessName} website`,
                      businessType: answers.businessType,
                      brief: briefText,
                    });
                  } finally {
                    setStartingBuild(false);
                  }
                }}
              >
                {startingBuild ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {startingBuild ? "Starting" : "Create build"}
              </Button>
            ) : null}
          </div>
        </div>
        {ready ? <pre className="max-h-[30rem] overflow-auto p-4 font-mono text-xs leading-5 whitespace-pre-wrap text-zinc-400 sm:p-5">{briefText}</pre> : <p className="p-5 text-sm text-zinc-500">Inspect a website or complete the three required brief fields to generate the developer specification.</p>}
      </section>
    </div>
  );
}
