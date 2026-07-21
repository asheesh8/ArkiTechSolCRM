"use client";

import { useState } from "react";
import { Check, Clipboard, FileSignature, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTRACTS = [
  { title: "Website design & development", use: "New website projects", body: `PROJECT SCOPE\nArkiTech Solutions will design and develop the website and deliver the features, pages, and integrations listed in the approved scope.\n\nCLIENT RESPONSIBILITIES\nThe client will provide timely access, content, approvals, and a single point of contact.\n\nPAYMENT & CHANGES\nFees and milestones are defined in the attached proposal. Work outside the approved scope requires a written change order.\n\nOWNERSHIP\nUpon final payment, the client owns the final approved deliverables. ArkiTech retains ownership of pre-existing tools and reusable systems.\n\nACCEPTANCE\nEach party agrees to the scope, schedule, payment terms, confidentiality, and termination terms stated in the final agreement.` },
  { title: "Ongoing maintenance agreement", use: "Support retainers", body: `SERVICES\nArkiTech Solutions will provide the maintenance, monitoring, updates, and support hours listed in the selected service plan.\n\nREQUESTS & RESPONSE\nRequests must be submitted through the agreed support channel. Response targets begin during normal business hours and are not guaranteed resolution times.\n\nBILLING\nService renews on the agreed billing cycle until cancelled in writing. Unused hours do not roll over unless stated in the proposal.\n\nEXCLUSIONS\nNew features, redesigns, third-party fees, and emergency recovery outside the plan are quoted separately.` },
  { title: "Mutual NDA", use: "Discovery and enterprise conversations", body: `CONFIDENTIAL INFORMATION\nEach party may disclose non-public business, technical, financial, or customer information for the purpose of evaluating or delivering the engagement.\n\nOBLIGATIONS\nThe receiving party will use reasonable care, limit access to people who need it, and use the information only for the engagement.\n\nEXCLUSIONS\nInformation already known, public through no breach, independently developed, or lawfully received from another source is not confidential.\n\nTERM\nThese confidentiality obligations continue for three years after disclosure, except trade secrets remain protected as required by law.` },
] as const;

const SCRIPTS = [
  { title: "First conversation", text: `Hi, this is [name] with ArkiTech Solutions. We help organizations improve the websites and systems their customers and teams rely on. I noticed [specific observation] and had one idea that could help [business] improve [outcome]. Do you have 30 seconds for me to explain it?` },
  { title: "Corporate discovery", text: `Thanks for taking the call. I’d like to understand what your team is trying to improve before I suggest anything. Where is the current website or workflow creating the most friction? Who is affected by it, and what would a successful result look like over the next six to twelve months?` },
  { title: "Voicemail", text: `Hi [name], this is [your name] at ArkiTech Solutions. I’m calling because I found an opportunity to improve [specific business outcome] for [business]. I’ll send a short note with the context. You can reach us at [company number]. Again, this is [your name] with ArkiTech Solutions.` },
  { title: "Follow-up", text: `Hi [name], I’m following up on our conversation about [priority]. Based on what you shared, the clearest first step is [recommendation]. If it makes sense, I can walk your team through a focused plan and timeline this week. Would [option one] or [option two] work better?` },
] as const;

function CopyCard({ title, subtitle, text }: { title: string; subtitle?: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return <article className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{title}</h2>{subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}</div><Button variant="outline" size="sm" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</Button></div>
    <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-600 dark:text-zinc-400">{text}</pre>
  </article>;
}

export default function ResourcesPage() {
  return <div className="space-y-10">
    <header><p className="text-sm font-medium text-[var(--accent)]">Sales enablement</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Templates & scripts</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Copy a starting point, then customize the scope, legal terms, and conversation for the client. Contract language should be reviewed before use.</p></header>
    <section className="space-y-4"><div className="flex items-center gap-2"><FileSignature className="h-5 w-5" /><h2 className="text-xl font-semibold">Contract templates</h2></div><div className="grid gap-4 xl:grid-cols-3">{CONTRACTS.map((item) => <CopyCard key={item.title} title={item.title} subtitle={item.use} text={item.body} />)}</div></section>
    <section className="space-y-4"><div className="flex items-center gap-2"><PhoneCall className="h-5 w-5" /><h2 className="text-xl font-semibold">Cold-call scripts</h2></div><div className="grid gap-4 lg:grid-cols-2">{SCRIPTS.map((item) => <CopyCard key={item.title} title={item.title} text={item.text} />)}</div></section>
  </div>;
}
