"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  DollarSign,
  ExternalLink,
  Loader2,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneOff,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  Target,
  Users,
  Voicemail,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type CallProfile = {
  prospectName: string;
  businessName: string;
  niche: string;
  city: string;
  referralName: string;
  referralRelationship: string;
  offer: string;
  monthlyPrice: string;
  averageJobValue: string;
  timeOne: string;
  timeTwo: string;
  notes: string;
};

type CallPath = "reviews" | "julie" | "audit";

type ScriptBeat = {
  label: string;
  line: string;
  kind?: "say" | "ask" | "coach";
};

type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const STORAGE_KEY = "arkitech:cold-call-workspace:v1";

const DEFAULT_PROFILE: CallProfile = {
  prospectName: "",
  businessName: "",
  niche: "local service",
  city: "",
  referralName: "Julie Becker",
  referralRelationship: "my mom's friend",
  offer: "Google visibility, reviews, and a conversion-focused website",
  monthlyPrice: "297",
  averageJobValue: "4000",
  timeOne: "later today",
  timeTwo: "tomorrow morning",
  notes: "",
};

const CALL_PATHS: { id: CallPath; label: string; note: string }[] = [
  { id: "reviews", label: "Reviews first", note: "Lead with what stood out" },
  { id: "julie", label: "Julie referral", note: "Warm referral structure" },
  { id: "audit", label: "Direct audit", note: "Get to the gap quickly" },
];

const CALL_STEPS = [
  { title: "Connect", intent: "Earn 30 seconds" },
  { title: "Discover", intent: "Find the real gap" },
  { title: "Offer", intent: "Sell the outcome" },
  { title: "Handle", intent: "Agree, then redirect" },
  { title: "Book", intent: "Lock a specific time" },
] as const;

const OUTCOMES = [
  { id: "no-answer", label: "No answer", icon: PhoneOff },
  { id: "voicemail", label: "Voicemail", icon: Voicemail },
  { id: "warm", label: "Warm lead", icon: Target },
  { id: "follow-up", label: "Follow up", icon: Clock3 },
  { id: "booked", label: "Meeting booked", icon: CalendarCheck },
  { id: "not-interested", label: "Not interested", icon: X },
] as const;

const CALL_EXAMPLES = [
  {
    title: "Overcoming objections",
    source: "Loom",
    href: "https://www.loom.com/share/3d45707d0b7e44b0a99c1246df15df4d?sid=2258b83c-5673-49b1-a6c3-12cc6ae9eb44",
  },
  {
    title: "Creating a warm lead without booking",
    source: "Loom",
    href: "https://www.loom.com/share/267d1982ecf04533b69346f4fb3afa83?sid=06229446-58ab-47e8-aca5-f966f586b512",
  },
  {
    title: "A no that later became a client",
    source: "Loom",
    href: "https://www.loom.com/share/c2734ef8592f4de78b86e4331f862399",
  },
  {
    title: "Callback after a voicemail",
    source: "Loom",
    href: "https://www.loom.com/share/307b95f8ea2e4eb0bbf8ec1fa5446b2e?sid=ec470b9d-b19f-43cf-b56d-2239afd9914f",
  },
  {
    title: "Warm lead and common objections",
    source: "Loom",
    href: "https://www.loom.com/share/0af94a63334a4602b84667678f275ab7",
  },
  {
    title: "Original framework live call",
    source: "YouTube",
    href: "https://www.youtube.com/watch?v=oBgZLGC2eA4&t=3s",
  },
] as const;

const CASE_STUDIES = [
  { title: "Client case study", href: "https://youtu.be/ET_ECNg8G3Q" },
  { title: "Quick proof clip", href: "https://youtube.com/shorts/uhQIxFEy5U8?feature=share" },
  { title: "Results short", href: "https://www.youtube.com/shorts/TXm2ZItKWUQ" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Agent",
  DEV: "Developer",
};

function valueOr(value: string, fallback: string) {
  return value.trim() || fallback;
}

function money(value: string, fallback: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function scriptFor(step: number, profile: CallProfile, callerName: string, path: CallPath): ScriptBeat[] {
  const prospect = valueOr(profile.prospectName, "[prospect name]");
  const business = valueOr(profile.businessName, "[business name]");
  const identity = profile.prospectName.trim() || profile.businessName.trim() || "[prospect or business]";
  const niche = valueOr(profile.niche, "[service niche]");
  const city = valueOr(profile.city, "their area");
  const referrer = valueOr(profile.referralName, "Julie Becker");
  const relationship = valueOr(profile.referralRelationship, "my mom's friend");
  const offer = valueOr(profile.offer, "your growth offer");
  const timeOne = valueOr(profile.timeOne, "later today");
  const timeTwo = valueOr(profile.timeTwo, "tomorrow morning");

  if (step === 0 && path === "julie") {
    return [
      { label: "Open", line: `Hey, is this ${identity}?`, kind: "say" },
      {
        label: "Referral hook",
        line: `Hey, what's up ${prospect}? ${relationship} ${referrer} referred me to you guys. She said you do super high-quality work - you're the ${niche}, right?`,
        kind: "say",
      },
      {
        label: "If they ask who",
        line: `Yeah, ${referrer} is ${relationship}. She mentioned your work and told me to reach out.`,
        kind: "say",
      },
      {
        label: "Start the conversation",
        line: "Sweet. She said you guys do not have much of a website or Google setup - is that still right?",
        kind: "ask",
      },
      {
        label: "If they already have it",
        line: "Got it. Then the better question is: is it consistently bringing you the kind of jobs you want?",
        kind: "ask",
      },
    ];
  }

  if (step === 0 && path === "audit") {
    return [
      { label: "Open", line: `Hey, is this ${identity}?`, kind: "say" },
      {
        label: "Pattern interrupt",
        line: `Perfect. ${callerName} with ArkiTech. I took a quick look at ${business} online and noticed a few easy wins in how your Google presence and website turn searches into calls. Mind if I give you the 20-second version?`,
        kind: "say",
      },
      {
        label: "If yes",
        line: "Great. I am not asking you to buy anything right now; I just want to see if what I noticed matches what you are seeing in the business.",
        kind: "say",
      },
      { label: "Then", line: "Move directly into discovery and ask how most new customers find them.", kind: "coach" },
    ];
  }

  if (step === 2 && path === "julie") {
    return [
      {
        label: "Keep it personal",
        line: `Okay, cool. I do not want to waste your time. I run ArkiTech, and we are taking on a small number of ${niche} businesses at a lower starter rate because we want a few strong case studies.`,
        kind: "say",
      },
      {
        label: "Ask",
        line: `Would you mind if I put together a quick audit for ${business} so you can take a look before deciding on anything?`,
        kind: "say",
      },
      {
        label: "Make it easy",
        line: "All I would need from you is a short form with the basics about the business. I handle the rest.",
        kind: "say",
      },
      {
        label: "If they ask price",
        line: "Most setups land between $97 and $497 a month depending on how much you want us to handle. The audit itself is free.",
        kind: "say",
      },
    ];
  }

  if (step === 2 && path === "audit") {
    return [
      {
        label: "Tie it back",
        line: `Based on what you just said, I can put together a three-point audit for ${business} focused on ${offer}.`,
        kind: "say",
      },
      {
        label: "Set the value",
        line: "I will show you the biggest gap, what a nearby competitor is doing better, and the first change I would make. No pitch deck and no obligation.",
        kind: "say",
      },
      {
        label: "Ask",
        line: "If the audit is specific to your business, would 10 minutes be worth it to walk through together?",
        kind: "ask",
      },
      {
        label: "If they ask price",
        line: "Most setups land between $97 and $497 a month depending on what needs fixing. First, let's see whether the opportunity is real.",
        kind: "say",
      },
    ];
  }

  switch (step) {
    case 0:
      return [
        { label: "Open", line: `Hey, is this ${identity}?`, kind: "say" },
        {
          label: "Reason for calling",
          line: `Perfect. ${callerName} here with ArkiTech. I came across ${business} while looking at ${niche} companies around ${city}, and your reviews stood out. Did I catch you for 30 seconds?`,
          kind: "say",
        },
        { label: "Then", line: "Stop talking and let them answer.", kind: "coach" },
        {
          label: "Gatekeeper",
          line: "No problem. Who handles new-customer growth or the website there?",
          kind: "say",
        },
      ];
    case 1:
      return [
        {
          label: "Start broad",
          line: `Quick question: how are most new customers finding ${business} right now?`,
          kind: "ask",
        },
        {
          label: "Go one layer deeper",
          line: "Are you happy with both the number of leads and the quality of the jobs coming in?",
          kind: "ask",
        },
        {
          label: "Find the gap",
          line: "If you could improve one part of how people find or choose you, what would it be?",
          kind: "ask",
        },
        {
          label: "Listen for",
          line: "Volume, job quality, seasonality, reviews, weak follow-up, or an outdated site. Write down their exact words.",
          kind: "coach",
        },
      ];
    case 2:
      return [
        {
          label: "Bridge",
          line: `That makes sense. What we do is help ${niche} businesses turn ${offer} into more booked, better-fit work.`,
          kind: "say",
        },
        {
          label: "Low-friction offer",
          line: `I'm not asking you to buy anything on this call. I can put together a quick audit for ${business} showing where you may be losing visibility and what nearby competitors are doing. Worth taking a look?`,
          kind: "say",
        },
        {
          label: "If they ask price",
          line: "Most setups land between $97 and $497 a month depending on how much you want us to handle. The first conversation is just the audit.",
          kind: "say",
        },
        {
          label: "Keep it grounded",
          line: "Use the problem they just named. Do not list every service ArkiTech offers.",
          kind: "coach",
        },
      ];
    case 3:
      return [
        { label: "1. Agree", line: "I totally understand.", kind: "say" },
        {
          label: "2. Clarify",
          line: "Is the main concern the timing, the cost, or whether this would actually bring in worthwhile business?",
          kind: "ask",
        },
        {
          label: "3. Reframe",
          line: "Answer the concern with one outcome and one proof point, then stop. Use the objection panel beside the script.",
          kind: "coach",
        },
        {
          label: "4. Ask again",
          line: "Would it be unreasonable to spend 10 minutes looking at the audit before deciding?",
          kind: "say",
        },
      ];
    default:
      return [
        {
          label: "Offer two times",
          line: `I've got ${timeOne} or ${timeTwo}. Which is easier for you?`,
          kind: "say",
        },
        {
          label: "Confirm",
          line: `Perfect. I'll send the invite now. On that call, you'll get a quick advertising audit for ${business} and a look at what competitors are doing.`,
          kind: "say",
        },
        {
          label: "Protect the show",
          line: `Besides something genuinely urgent, is there anything that might pull you away at ${timeOne}?`,
          kind: "ask",
        },
        {
          label: "Immediately after",
          line: `Send ${prospect} the calendar invite and the most relevant case study before making the next call.`,
          kind: "coach",
        },
      ];
  }
}

function AccessDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setSaved(false);

    fetch("/api/cold-call/access", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load access.");
        if (cancelled) return;
        setUsers(data.users || []);
        setSelected(new Set(data.userIds || []));
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load access.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  function toggle(userId: string) {
    setSaved(false);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    const response = await fetch("/api/cold-call/access", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: Array.from(selected) }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setError(data.error || "Could not save access.");
      return;
    }

    setSelected(new Set(data.userIds || []));
    setSaved(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/55 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Close access settings"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cold-call-access-title"
        className="crm-card-strong relative z-10 flex max-h-[min(720px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg border"
      >
        <header className="flex items-start gap-3 border-b border-[var(--border)] p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="cold-call-access-title" className="text-base font-semibold">Cold call access</h2>
            <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
              Owners always have access. Choose any additional teammates who should see the playbook.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="min-h-48 flex-1 overflow-y-auto p-3 sm:p-4">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-[var(--muted)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-sm text-[var(--muted)]">No active teammates found.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {users.map((user) => {
                const owner = user.role === "OWNER";
                const checked = owner || selected.has(user.id);
                return (
                  <label key={user.id} className={cn("flex min-h-16 items-center gap-3 py-3", !owner && "cursor-pointer")}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={owner}
                      onChange={() => toggle(user.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition",
                        checked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-[var(--border)] bg-[var(--surface-strong)] text-transparent",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{user.name}</span>
                      <span className="block truncate text-xs text-[var(--muted)]">{user.email}</span>
                    </span>
                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
                      {owner ? "Always" : ROLE_LABELS[user.role] || user.role}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {error ? <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-[var(--border)] p-4">
          <span className="text-sm text-emerald-600 dark:text-emerald-300">{saved ? "Access updated" : ""}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={loading || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save access
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export function ColdCallWorkspace({
  callerName,
  canManageAccess,
}: {
  callerName: string;
  canManageAccess: boolean;
}) {
  const [profile, setProfile] = useState<CallProfile>(DEFAULT_PROFILE);
  const [callPath, setCallPath] = useState<CallPath>("reviews");
  const [activeStep, setActiveStep] = useState(0);
  const [toolTab, setToolTab] = useState<"objections" | "follow-up" | "examples">("objections");
  const [activeObjection, setActiveObjection] = useState(0);
  const [outcome, setOutcome] = useState("");
  const [copied, setCopied] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.profile) setProfile({ ...DEFAULT_PROFILE, ...saved.profile });
      if (Number.isInteger(saved?.activeStep)) {
        setActiveStep(Math.min(Math.max(saved.activeStep, 0), CALL_STEPS.length - 1));
      }
      if (CALL_PATHS.some((path) => path.id === saved?.callPath)) {
        setCallPath(saved.callPath);
      }
      if (typeof saved?.outcome === "string") setOutcome(saved.outcome);
    } catch {
      // A stale browser draft should never block the call workspace.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, callPath, activeStep, outcome }));
    } catch {
      // Private browsing or storage limits should not interrupt a call.
    }
  }, [activeStep, callPath, hydrated, outcome, profile]);

  const beats = useMemo(
    () => scriptFor(activeStep, profile, callerName, callPath),
    [activeStep, callPath, callerName, profile],
  );

  const price = Number(profile.monthlyPrice.replace(/[^0-9.]/g, ""));
  const jobValue = Number(profile.averageJobValue.replace(/[^0-9.]/g, ""));
  const monthsCovered = price > 0 && jobValue > 0 ? Math.max(1, Math.floor(jobValue / price)) : null;
  const business = valueOr(profile.businessName, "[business name]");
  const prospect = valueOr(profile.prospectName, "[prospect name]");

  const objections = [
    {
      title: "We already have enough business",
      principle: "Shift from more volume to better jobs and pricing power.",
      response: `Totally fair. This is not only about getting more volume. A stronger presence can help ${business} win better-fit, higher-value jobs and quote overflow more confidently. Would a 10-minute audit be useful if we only focused on lead quality and pricing power?`,
    },
    {
      title: "We already have a website",
      principle: "Having a site is different from having one that converts.",
      response: `That's good - it means we are not starting from zero. The question is whether it is turning Google traffic into calls. I can show you two or three places where ${business} may be leaking opportunities. If there is nothing meaningful, I'll tell you that.`,
    },
    {
      title: "It sounds too expensive",
      principle: "Use their real job value; do not argue about price.",
      response: `I understand. Roughly what is one completed job worth? If it is around ${money(profile.averageJobValue, "$[job value]")}, one additional job would cover ${monthsCovered ? `${monthsCovered} months` : "several months"} at ${money(profile.monthlyPrice, "$[monthly price]")} per month. Let's first see whether the opportunity is believable for your business.`,
    },
    {
      title: "Just send me information",
      principle: "Earn one useful detail before agreeing to send anything.",
      response: "Absolutely. So I do not send generic stuff, which matters most right now: more calls, better jobs, stronger reviews, or a better website? I'll send one relevant example and follow up after you have seen it.",
    },
    {
      title: "I'm not interested",
      principle: "Clarify once, then respect a firm no.",
      response: "Fair enough. Before I let you go, is that because you are already set for work, the timing is bad, or you do not see this helping? I only ask so I do not follow up with something irrelevant.",
    },
    {
      title: "I'm busy right now",
      principle: "Make the next step smaller and specific.",
      response: `Got it. I will be brief. Is ${valueOr(profile.timeOne, "later today")} or ${valueOr(profile.timeTwo, "tomorrow morning")} a better time for a 10-minute look?`,
    },
  ];

  const followUps = [
    {
      id: "post-call",
      title: "Right after a good call",
      text: `Thanks for the time, ${prospect}. Here is the example I mentioned for ${valueOr(profile.niche, "your industry")}: [case study link]. The useful part is how they turned stronger Google trust into more booked work. Looking forward to showing you the audit for ${business}.`,
    },
    {
      id: "voicemail",
      title: "After a voicemail",
      text: `Hey ${prospect}, ${callerName} from ArkiTech. I just left you a quick voicemail after taking a look at ${business}. I noticed a couple of easy ways you could stand out more online. Worth a quick conversation?`,
    },
    {
      id: "warm-lead",
      title: "Warm lead, no appointment",
      text: `Hey ${prospect}, circling back on the quick audit for ${business}. I noticed one more thing your nearby competitors are doing that may be worth showing you. Is ${valueOr(profile.timeOne, "later today")} or ${valueOr(profile.timeTwo, "tomorrow morning")} easier?`,
    },
    {
      id: "no-response",
      title: "Case study follow-up",
      text: "Did you get a chance to look at that example? Curious what stood out to you.",
    },
  ];

  function updateProfile<K extends keyof CallProfile>(key: K, value: CallProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function copyText(text: string, marker: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(marker);
      window.setTimeout(() => setCopied((current) => (current === marker ? "" : current)), 1600);
    } catch {
      setCopied("");
    }
  }

  function newCall() {
    setProfile((current) => ({
      ...DEFAULT_PROFILE,
      niche: current.niche,
      city: current.city,
      referralName: current.referralName,
      referralRelationship: current.referralRelationship,
      offer: current.offer,
      monthlyPrice: current.monthlyPrice,
      averageJobValue: current.averageJobValue,
      timeOne: current.timeOne,
      timeTwo: current.timeTwo,
    }));
    setActiveStep(0);
    setOutcome("");
    setSetupOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startCall() {
    setSetupOpen(false);
    window.requestAnimationFrame(() => {
      document.getElementById("cold-call-script")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function finishCall() {
    document.getElementById("call-wrap-up")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function copyRecap() {
    const selectedOutcome = OUTCOMES.find((item) => item.id === outcome)?.label || "Not selected";
    const recap = [
      `Cold call: ${business}`,
      `Prospect: ${prospect}`,
      `Path: ${CALL_PATHS.find((path) => path.id === callPath)?.label || callPath}`,
      `Outcome: ${selectedOutcome}`,
      `Notes: ${profile.notes.trim() || "None"}`,
    ].join("\n");
    void copyText(recap, "recap");
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <PageHeader
        eyebrow="Sales playbook"
        title="Cold call room"
        description="A natural call flow for opening a conversation, finding the gap, handling resistance, and earning the next meeting."
        actions={
          <>
            {canManageAccess ? (
              <Button variant="outline" onClick={() => setShareOpen(true)}>
                <Share2 className="h-4 w-4" />
                Share access
              </Button>
            ) : null}
            <Button onClick={newCall}>
              <RotateCcw className="h-4 w-4" />
              New call
            </Button>
          </>
        }
      />

      <section className="grid gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
        {[
          [Target, "Get in conversation", "The first win is earning 30 seconds."],
          [DollarSign, "Sell the outcome", "Talk booked work, trust, and better jobs."],
          [PhoneCall, "Follow up", "Warm interest deserves more than one attempt."],
        ].map(([Icon, title, body]) => (
          <div key={String(title)} className="flex min-h-20 items-center gap-3 bg-[var(--surface-strong)] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{title as string}</span>
              <span className="mt-0.5 block text-xs leading-5 text-[var(--muted)]">{body as string}</span>
            </span>
          </div>
        ))}
      </section>

      <Card>
        <CardHeader className="border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <CardTitle className="flex min-w-0 flex-1 items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <span className="shrink-0">Call setup</span>
              {!setupOpen ? (
                <span className="truncate text-xs font-normal text-[var(--muted)]">
                  {prospect} / {business} / {CALL_PATHS.find((path) => path.id === callPath)?.label}
                </span>
              ) : null}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSetupOpen((open) => !open)}
              aria-label={setupOpen ? "Collapse call setup" : "Expand call setup"}
              title={setupOpen ? "Collapse call setup" : "Expand call setup"}
            >
              {setupOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        {setupOpen ? (
          <CardContent className="pt-4 sm:pt-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="cold-call-prospect">Prospect</Label>
              <Input id="cold-call-prospect" value={profile.prospectName} onChange={(event) => updateProfile("prospectName", event.target.value)} placeholder="First name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cold-call-business">Business</Label>
              <Input id="cold-call-business" value={profile.businessName} onChange={(event) => updateProfile("businessName", event.target.value)} placeholder="Business name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cold-call-niche">Niche</Label>
              <Input id="cold-call-niche" value={profile.niche} onChange={(event) => updateProfile("niche", event.target.value)} placeholder="Plumber, cleaner, roofer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cold-call-city">City / area</Label>
              <Input id="cold-call-city" value={profile.city} onChange={(event) => updateProfile("city", event.target.value)} placeholder="Burlington, VT" />
            </div>
            {callPath === "julie" ? (
              <>
                <div className="space-y-1.5 sm:col-span-1 xl:col-span-2">
                  <Label htmlFor="cold-call-referrer">Referrer name</Label>
                  <Input id="cold-call-referrer" value={profile.referralName} onChange={(event) => updateProfile("referralName", event.target.value)} placeholder="Julie Becker" />
                </div>
                <div className="space-y-1.5 sm:col-span-1 xl:col-span-2">
                  <Label htmlFor="cold-call-relationship">Relationship</Label>
                  <Input id="cold-call-relationship" value={profile.referralRelationship} onChange={(event) => updateProfile("referralRelationship", event.target.value)} placeholder="my mom's friend" />
                  <p className="text-xs text-[var(--muted)]">Use the real name and relationship behind the referral.</p>
                </div>
              </>
            ) : null}
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-2">
              <Label htmlFor="cold-call-offer">Outcome to lead with</Label>
              <Input id="cold-call-offer" value={profile.offer} onChange={(event) => updateProfile("offer", event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:col-span-2 xl:col-span-2">
              <div className="space-y-1.5">
                <Label htmlFor="cold-call-price">Monthly price</Label>
                <Input id="cold-call-price" inputMode="decimal" value={profile.monthlyPrice} onChange={(event) => updateProfile("monthlyPrice", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cold-call-job-value">Average job value</Label>
                <Input id="cold-call-job-value" inputMode="decimal" value={profile.averageJobValue} onChange={(event) => updateProfile("averageJobValue", event.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-1 xl:col-span-2">
              <Label htmlFor="cold-call-time-one">Appointment option 1</Label>
              <Input id="cold-call-time-one" value={profile.timeOne} onChange={(event) => updateProfile("timeOne", event.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-1 xl:col-span-2">
              <Label htmlFor="cold-call-time-two">Appointment option 2</Label>
              <Input id="cold-call-time-two" value={profile.timeTwo} onChange={(event) => updateProfile("timeTwo", event.target.value)} />
            </div>
            </div>
            <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-4">
              <Button onClick={startCall}>
                <PhoneCall className="h-4 w-4" />
                Ready to call
              </Button>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.8fr)]">
        <div className="space-y-5">
          <Card id="cold-call-script" className="scroll-mt-4 overflow-hidden lg:scroll-mt-28">
            <div className="border-b border-[var(--border)] bg-[var(--surface-strong)] p-2.5 sm:flex sm:items-center sm:gap-3">
              <p className="mb-2 shrink-0 text-xs font-semibold text-[var(--muted)] sm:mb-0">Call path</p>
              <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5" role="radiogroup" aria-label="Call path">
                {CALL_PATHS.map((path) => {
                  const Icon = path.id === "reviews" ? Target : path.id === "julie" ? Users : Search;
                  const selected = callPath === path.id;
                  return (
                    <button
                      key={path.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setCallPath(path.id)}
                      className={cn(
                        "flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-left transition sm:justify-start sm:px-3",
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]/40",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold sm:text-sm">{path.label}</span>
                        <span className="hidden truncate text-[11px] sm:block">{path.note}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="scrollbar-none crm-rail overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)]" role="tablist" aria-label="Call stages">
              <div className="flex min-w-[620px] p-2">
                {CALL_STEPS.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    role="tab"
                    aria-selected={activeStep === index}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "flex h-14 min-w-0 flex-1 items-center gap-2 rounded-lg px-3 text-left transition",
                      activeStep === index
                        ? "bg-[var(--surface-strong)] text-zinc-950 shadow-sm ring-1 ring-[var(--border)] dark:text-white"
                        : "text-[var(--muted)] hover:bg-[var(--surface-strong)]/70",
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      activeStep === index
                        ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : index < activeStep
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                          : "border-[var(--border)]",
                    )}>
                      {index < activeStep ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{step.title}</span>
                      <span className="block truncate text-[11px]">{step.intent}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="pt-5 sm:pt-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--accent)]">Stage {activeStep + 1} of {CALL_STEPS.length}</p>
                  <h3 className="mt-1 text-xl font-semibold">{CALL_STEPS[activeStep].title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{CALL_STEPS[activeStep].intent}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyText(beats.map((beat) => `${beat.label}: ${beat.line}`).join("\n\n"), "script")}>
                  {copied === "script" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === "script" ? "Copied" : "Copy script"}
                </Button>
              </div>

              <div className="min-h-[390px] divide-y divide-[var(--border)] sm:min-h-[360px]">
                {beats.map((beat) => (
                  <div key={`${beat.label}-${beat.line}`} className={cn("py-4 first:pt-0 last:pb-0", beat.kind === "coach" && "text-[var(--muted)]")}>
                    <p className={cn(
                      "mb-1.5 text-xs font-semibold",
                      beat.kind === "ask" ? "text-cyan-700 dark:text-cyan-300" : beat.kind === "coach" ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300",
                    )}>
                      {beat.label}
                    </p>
                    <p className={cn("max-w-4xl leading-7", beat.kind === "coach" ? "text-sm" : "text-[17px] font-medium text-zinc-900 dark:text-zinc-100")}>{beat.line}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <Button variant="outline" onClick={() => setActiveStep((step) => Math.max(0, step - 1))} disabled={activeStep === 0}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {activeStep < CALL_STEPS.length - 1 ? (
                  <Button onClick={() => setActiveStep((step) => Math.min(CALL_STEPS.length - 1, step + 1))}>
                    Next stage
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={finishCall}>
                    Wrap up
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card id="call-wrap-up">
            <CardHeader className="border-b border-[var(--border)]">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Call wrap-up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 sm:pt-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {OUTCOMES.map((item) => {
                  const Icon = item.icon;
                  const selected = outcome === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOutcome(item.id)}
                      className={cn(
                        "flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                          : "border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--accent)]/50",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cold-call-notes">Call notes</Label>
                <Textarea
                  id="cold-call-notes"
                  value={profile.notes}
                  onChange={(event) => updateProfile("notes", event.target.value)}
                  placeholder="Pain point, objection, promised follow-up, and anything to remember..."
                  className="min-h-32"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={copyRecap}>
                  {copied === "recap" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === "recap" ? "Copied" : "Copy recap"}
                </Button>
                <Button onClick={newCall}>
                  <Phone className="h-4 w-4" />
                  Start next call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden xl:sticky xl:top-28">
          <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--surface)] p-1.5" role="tablist" aria-label="Call support">
            {([
              ["objections", "Objections"],
              ["follow-up", "Follow-up"],
              ["examples", "Examples"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={toolTab === id}
                onClick={() => setToolTab(id)}
                className={cn(
                  "h-10 rounded-lg px-2 text-sm font-semibold transition",
                  toolTab === id
                    ? "bg-[var(--surface-strong)] text-zinc-950 shadow-sm ring-1 ring-[var(--border)] dark:text-white"
                    : "text-[var(--muted)] hover:text-zinc-900 dark:hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <CardContent className="min-h-[560px] pt-4 sm:pt-5">
            {toolTab === "objections" ? (
              <div>
                <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-3 xl:grid xl:grid-cols-2 xl:overflow-visible">
                  {objections.map((objection, index) => (
                    <button
                      key={objection.title}
                      type="button"
                      onClick={() => setActiveObjection(index)}
                      className={cn(
                        "min-h-11 min-w-44 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition xl:min-w-0",
                        activeObjection === index
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--accent)]/40",
                      )}
                    >
                      {objection.title}
                    </button>
                  ))}
                </div>
                <div className="mt-3 border-t border-[var(--border)] pt-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{objections[activeObjection].title}</h3>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{objections[activeObjection].principle}</p>
                    </div>
                  </div>
                  <blockquote className="mt-5 border-l-2 border-[var(--accent)] pl-4 text-[16px] font-medium leading-7 text-zinc-900 dark:text-zinc-100">
                    {objections[activeObjection].response}
                  </blockquote>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={() => copyText(objections[activeObjection].response, "objection")}
                  >
                    {copied === "objection" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === "objection" ? "Copied" : "Copy response"}
                  </Button>
                  <div className="mt-6 border-t border-[var(--border)] pt-4">
                    <p className="text-sm font-semibold">The rule</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Agree first. Ask one clarifying question. Reframe around the outcome. Ask for the meeting once more. Respect a clear no.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {toolTab === "follow-up" ? (
              <div className="divide-y divide-[var(--border)]">
                {followUps.map((followUp) => (
                  <div key={followUp.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">{followUp.title}</h3>
                      <Button variant="ghost" size="icon" onClick={() => copyText(followUp.text, followUp.id)} aria-label={`Copy ${followUp.title}`}>
                        {copied === followUp.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{followUp.text}</p>
                  </div>
                ))}
                <div className="pt-4">
                  <p className="text-sm font-semibold">Follow-up rhythm</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Send proof right after the call. Follow up with a useful reason, vary the channel, and keep going until the prospect gives a clear answer.</p>
                </div>
              </div>
            ) : null}

            {toolTab === "examples" ? (
              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-semibold">Call recordings</h3>
                  <div className="mt-2 divide-y divide-[var(--border)]">
                    {CALL_EXAMPLES.map((example) => (
                      <a
                        key={example.href}
                        href={example.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex min-h-14 items-center gap-3 py-2.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                          <PhoneCall className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold group-hover:text-[var(--accent)]">{example.title}</span>
                          <span className="block text-xs text-[var(--muted)]">{example.source}</span>
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                      </a>
                    ))}
                  </div>
                </section>
                <section className="border-t border-[var(--border)] pt-5">
                  <h3 className="text-sm font-semibold">Case studies to send</h3>
                  <div className="mt-2 divide-y divide-[var(--border)]">
                    {CASE_STUDIES.map((study) => (
                      <a key={study.href} href={study.href} target="_blank" rel="noreferrer" className="group flex min-h-12 items-center gap-3 py-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <Target className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold group-hover:text-[var(--accent)]">{study.title}</span>
                        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <AccessDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
