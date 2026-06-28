"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Loader2, Mail, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Plan presets ─────────────────────────────────────────────────────────────
const PLAN_PRESETS = [
  {
    name: "Basic",
    price: 197,
    billing: "MONTHLY",
    items: [
      { description: "Website design & development", amount: 147 },
      { description: "Monthly hosting & maintenance", amount: 50 },
    ],
  },
  {
    name: "Standard",
    price: 349,
    billing: "MONTHLY",
    items: [
      { description: "Custom website design & development", amount: 199 },
      { description: "Monthly hosting, maintenance & updates", amount: 100 },
      { description: "SEO & Google Business optimization", amount: 50 },
    ],
  },
  {
    name: "One-Time Build",
    price: 2000,
    billing: "ONE_TIME",
    items: [
      { description: "Full website design & development", amount: 1900 },
      { description: "Launch & setup", amount: 100 },
    ],
  },
  {
    name: "Edit / Add-on",
    price: 50,
    billing: "ONE_TIME",
    items: [
      { description: "Website edit or addition", amount: 50 },
    ],
  },
  {
    name: "Custom",
    price: 0,
    billing: "MONTHLY",
    items: [{ description: "", amount: 0 }],
  },
];

type LineItem = { description: string; amount: number };
type Lead = { id: string; businessName: string; email: string | null; phone: string | null; name?: string };

const STEPS = ["Choose Plan", "Build Contract", "Send & Sign", "Stripe Setup"];

export default function OnboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [lead, setLead] = useState<Lead | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Step 1: plan
  const [selectedPlan, setSelectedPlan] = useState(0);

  // Step 2: contract builder
  const [planName, setPlanName] = useState(PLAN_PRESETS[0].name);
  const [items, setItems] = useState<LineItem[]>(PLAN_PRESETS[0].items);
  const [billing, setBilling] = useState<string>(PLAN_PRESETS[0].billing);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");

  // Client info
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  useEffect(() => {
    fetch(`/api/leads/${id}`).then((r) => r.json()).then((d) => {
      setLead(d.lead);
      setClientEmail(d.lead?.email ?? "");
      setClientPhone(d.lead?.phone ?? "");
      setClientName(d.lead?.businessName ?? "");
    });
  }, [id]);

  const subtotal = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const total = subtotal + Number(tax || 0);

  function applyPreset(idx: number) {
    const p = PLAN_PRESETS[idx];
    setSelectedPlan(idx);
    setPlanName(p.name);
    setItems(p.items.map((i) => ({ ...i })));
    setBilling(p.billing);
    setTax(0);
  }

  function setItem(idx: number, field: keyof LineItem, val: string | number) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: field === "amount" ? Number(val) : val } : item));
  }

  function addItem() { setItems((prev) => [...prev, { description: "", amount: 0 }]); }
  function removeItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  async function createContractAndClient() {
    setBusy(true);
    setError("");
    try {
      // Ensure client exists
      let cId = clientId;
      if (!cId) {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: id, name: clientName, email: clientEmail, phone: clientPhone, businessName: lead?.businessName ?? clientName }),
        });
        const data = await res.json();
        if (!res.ok) {
          // Client might already exist — try to find by email
          if (res.status === 409) {
            const findRes = await fetch(`/api/clients?email=${encodeURIComponent(clientEmail)}`);
            const findData = await findRes.json();
            cId = findData.clients?.[0]?.id;
          }
          if (!cId) { setError(data.error ?? "Could not create client"); setBusy(false); return; }
        } else {
          cId = data.client.id;
        }
        setClientId(cId!);
      }

      // Create contract
      const res2 = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: cId, planName, lineItems: items, subtotal, tax, total, billingCycle: billing, notes }),
      });
      const data2 = await res2.json();
      if (!res2.ok) { setError(data2.error ?? "Could not create contract"); setBusy(false); return; }
      setContractId(data2.contract.id);
      setStep(2);
    } finally {
      setBusy(false);
    }
  }

  async function sendContract() {
    if (!contractId) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/contracts/${contractId}/send`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Could not send"); return; }
    setSignUrl(data.signUrl);
    setStep(3);
  }

  async function copyLink() {
    if (!signUrl) return;
    await navigator.clipboard.writeText(signUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!lead) return <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back */}
      <button type="button" onClick={() => router.push(`/clients/${id}`)} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
        <ArrowLeft className="h-4 w-4" /> Back to {lead.businessName}
      </button>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-400"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 rounded transition-all ${i < step ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Choose Plan ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Choose a plan</h2>
            <p className="mt-1 text-sm text-zinc-500">Select a preset or build a custom price for {lead.businessName}.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PLAN_PRESETS.map((plan, i) => (
              <button
                key={plan.name}
                type="button"
                onClick={() => applyPreset(i)}
                className={`rounded-xl border p-5 text-left transition hover:border-indigo-400 ${selectedPlan === i ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{plan.name}</p>
                    <p className="mt-0.5 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {plan.price ? `$${plan.price}` : "Custom"}<span className="text-sm font-normal text-zinc-500">{plan.price && plan.billing === "MONTHLY" ? "/mo" : ""}</span>
                    </p>
                  </div>
                  {selectedPlan === i && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-zinc-500">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-indigo-500" />
                      {item.description || "Custom line item"}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(1)}>
              Next — Build contract <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 1: Build Contract ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Build the contract</h2>
            <p className="mt-1 text-sm text-zinc-500">Confirm client info and customize the line items.</p>
          </div>

          <Card>
            <CardHeader><CardTitle>Client info</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Contact name</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jane Smith" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="jane@business.com" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(802) 555-0100" /></div>
              <div className="space-y-2">
                <Label>Billing cycle</Label>
                <Select value={billing} onChange={(e) => setBilling(e.target.value)}>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="ONE_TIME">One-time</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Plan: {planName}</CardTitle></div>
                <Input value={planName} onChange={(e) => setPlanName(e.target.value)} className="max-w-[200px] text-sm" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item.description}
                    onChange={(e) => setItem(i, "description", e.target.value)}
                    placeholder="Service description"
                    className="flex-1"
                  />
                  <div className="flex w-28 items-center gap-1">
                    <span className="text-zinc-500">$</span>
                    <Input
                      type="number"
                      min="0"
                      value={item.amount}
                      onChange={(e) => setItem(i, "amount", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="shrink-0 rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700">
                <Plus className="h-4 w-4" /> Add line item
              </button>

              <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500">Tax / fees</span>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">$</span>
                    <Input type="number" min="0" value={tax} onChange={(e) => setTax(Number(e.target.value))} className="w-24" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-bold dark:border-zinc-800">
                  <span>Total</span><span>${total.toFixed(2)}{billing === "MONTHLY" ? " / mo" : ""}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Additional terms <span className="font-normal text-zinc-500">(optional)</span></CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional terms, deliverables, or expectations you want to include in the contract…" rows={4} />
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <Button onClick={createContractAndClient} disabled={busy || !clientEmail || !clientName || total === 0}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Generate contract <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Send & Sign ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Send the contract</h2>
            <p className="mt-1 text-sm text-zinc-500">Send {clientName} a signing link via email, or copy the link to share another way.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-xl bg-indigo-50 p-5 dark:bg-indigo-950">
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{planName}</p>
                <p className="mt-1 text-3xl font-bold text-indigo-900 dark:text-indigo-100">${total.toFixed(2)}<span className="text-base font-normal text-indigo-600">{billing === "MONTHLY" ? " / mo" : ""}</span></p>
                <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{items.length} service{items.length !== 1 ? "s" : ""} · to {clientName} ({clientEmail})</p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {!signUrl ? (
                <Button onClick={sendContract} disabled={busy} className="w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {busy ? "Sending…" : `Email contract to ${clientEmail}`}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Email sent!</p>
                      <p className="text-xs text-green-700 dark:text-green-400">{clientName} will receive the contract at {clientEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={signUrl} className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900" />
                    <Button variant="outline" size="sm" onClick={copyLink}>
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-400">Share this link via text, DM, or WhatsApp if preferred.</p>
                </div>
              )}

              {!signUrl && (
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                  <span className="text-xs text-zinc-400">or</span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                </div>
              )}

              {!signUrl && contractId && (
                <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Copy signing link directly</p>
                  <p className="mt-1 text-xs text-zinc-500">Paste the link into a text message, DM, or anywhere else.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={async () => {
                    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
                    // Get sign token from API
                    const res = await fetch(`/api/contracts/${contractId}`);
                    const data = await res.json();
                    const url = `${base}/sign/${data.contract.signToken}`;
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy signing link"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            {signUrl && (
              <Button onClick={() => setStep(3)}>
                Next — Stripe setup <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Stripe Setup ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Stripe billing setup</h2>
            <p className="mt-1 text-sm text-zinc-500">The first invoice has been created and will appear in the client portal. Stripe invoicing kicks in when they pay.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF] font-bold text-lg">S</div>
                <div>
                  <p className="font-semibold">Stripe connected</p>
                  <p className="text-sm text-zinc-500">Add your Stripe keys in <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">STRIPE_SECRET_KEY</code> to activate live payments.</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">What happens next:</p>
                {[
                  "Client receives the contract signing email",
                  "When they sign, a first invoice is auto-created ($" + total.toFixed(2) + ")",
                  "They get portal access to pay, view invoices & submit requests",
                  "You get notified when payment lands",
                  "Monthly reminders send automatically before each due date",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{i + 1}</div>
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={() => router.push(`/clients/${id}`)} className="flex-1">
              <CheckCircle2 className="h-4 w-4" /> Done — back to client profile
            </Button>
            <Button variant="outline" onClick={() => router.push("/clients")}>
              <Send className="h-4 w-4" /> All clients
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
