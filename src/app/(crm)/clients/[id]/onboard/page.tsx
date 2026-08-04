"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, FileText, Image as ImageIcon, Loader2, Mail, Send, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Lead = { id: string; businessName: string; email: string | null; phone: string | null; name?: string };

const STEPS = ["Build Agreement", "Send & Sign", "Portal Handoff"];

// The agreement is whatever the owner already signs off on — a PDF contract or
// a photo/scan of one.
const ACCEPT_ATTR = "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png";
const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

function isImageFile(name: string) {
  const n = name.toLowerCase();
  return n.endsWith(".jpg") || n.endsWith(".jpeg") || n.endsWith(".png");
}

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

  // Step 1: the agreement
  const [planName, setPlanName] = useState("Service Agreement");
  const [billing, setBilling] = useState("MONTHLY");
  const [notes, setNotes] = useState("");

  // Uploaded agreement document
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [docAmount, setDocAmount] = useState(0);

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

  const displayTotal = Number(docAmount || 0);

  function onPickFile(f: File | null) {
    if (!f) return;
    const name = f.name.toLowerCase();
    const ok = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
      || f.type === "application/pdf"
      || f.type.startsWith("image/jpeg")
      || f.type.startsWith("image/png");
    if (!ok) {
      setError("Please upload a PDF, JPEG, or PNG.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function uploadContractFile(f: File): Promise<{ key: string; name: string }> {
    // Send the file as a raw binary body (not FormData) — Safari throws
    // "The string did not match the expected pattern" on multipart File uploads.
    const res = await fetch(`/api/contracts/upload?filename=${encodeURIComponent(f.name)}`, {
      method: "POST",
      headers: { "Content-Type": f.type || "application/octet-stream" },
      body: f,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Could not upload the file");
    return { key: data.key, name: f.name };
  }

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

      // Upload the agreement document first — it is the contract
      if (!file) { setError("Add the agreement file before generating."); setBusy(false); return; }
      let doc: { key: string; name: string };
      try {
        doc = await uploadContractFile(file);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed"); setBusy(false); return;
      }

      const amount = Number(docAmount || 0);
      const payload = {
        clientId: cId,
        planName: planName || "Service Agreement",
        lineItems: [{ description: planName || "Service Agreement", amount }],
        subtotal: amount,
        tax: 0,
        total: amount,
        billingCycle: billing,
        notes,
        documentKey: doc.key,
        documentName: doc.name,
      };

      // Create contract
      const res2 = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data2 = await res2.json();
      if (!res2.ok) { setError(data2.error ?? "Could not create contract"); setBusy(false); return; }
      setContractId(data2.contract.id);
      setStep(1);
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
    setStep(2);
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
              <span className={`text-center text-[10px] font-medium leading-tight sm:whitespace-nowrap sm:text-xs ${i === step ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-400"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 self-start rounded transition-all sm:mx-2 ${i < step ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Build Agreement (upload the signed-off document) ── */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Build the agreement</h2>
            <p className="mt-1 text-sm text-zinc-500">Confirm client info, then upload the agreement for {lead.businessName} — a PDF, or a photo/scan of a signed page.</p>
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <CardTitle>Upload agreement</CardTitle>
                <Input value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Agreement name" className="w-full text-sm sm:max-w-[200px]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!file ? (
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); onPickFile(e.dataTransfer.files?.[0] ?? null); }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${dragOver ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-zinc-300 hover:border-indigo-400 dark:border-zinc-700"}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Drop the agreement here, or click to browse</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Your own contract, agreement, or proposal — PDF, JPEG, or PNG</p>
                  </div>
                  <input type="file" accept={ACCEPT_ATTR} className="hidden" onChange={(e) => onPickFile(e.target.files?.[0] ?? null)} />
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isImageFile(file.name) ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950" : "bg-red-100 text-red-600 dark:bg-red-950"}`}>
                    {isImageFile(file.name) ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{file.name}</p>
                    <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(0)} KB · ready to send for signature</p>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800 sm:flex-row sm:items-end">
                <div className="space-y-1.5">
              <Label>Contract value <span className="font-normal text-zinc-400">(internal reference)</span></Label>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">$</span>
                    <Input type="number" min="0" value={docAmount || ""} onChange={(e) => setDocAmount(Number(e.target.value))} className="w-32" placeholder="0.00" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 sm:pb-2.5">Used for the client packet and internal reporting. No invoice or Stripe payment is created.</p>
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

          <div className="flex justify-end">
            <Button onClick={createContractAndClient} disabled={busy || !clientEmail || !clientName || !file}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Generate contract <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 1: Send & Sign ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Send the contract</h2>
            <p className="mt-1 text-sm text-zinc-500">Send {clientName} a signing link via email, or copy the link to share another way.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-xl bg-indigo-50 p-5 dark:bg-indigo-950">
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{planName}</p>
                <p className="mt-1 text-3xl font-bold text-indigo-900 dark:text-indigo-100">${displayTotal.toFixed(2)}<span className="text-base font-normal text-indigo-600">{billing === "MONTHLY" ? " / mo" : ""}</span></p>
                <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{file?.name ?? "Uploaded agreement"} · to {clientName} ({clientEmail})</p>
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
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                    <input readOnly value={signUrl} className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900" />
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
            <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            {signUrl && (
              <Button onClick={() => setStep(2)}>
                Next — Portal handoff <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Portal Handoff ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Portal handoff</h2>
            <p className="mt-1 text-sm text-zinc-500">The contract is ready for signature. Once signed, the client portal becomes their hub for files, requests, approvals, and updates.</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-lg dark:bg-indigo-950 dark:text-indigo-300">A</div>
                <div>
                  <p className="font-semibold">Client portal workflow ready</p>
                  <p className="text-sm text-zinc-500">No Stripe setup is required. Keep payment collection outside this CRM while the portal handles delivery communication.</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">What happens next:</p>
                {[
                  "Client receives the contract signing email",
                  "ArkiTech counter-signs from the client profile",
                  "The signed agreement stays attached to the client packet",
                  "Client uses the portal to submit requests and share files",
                  "Developer work is tracked on the internal work board with estimates, repos, and due dates",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{i + 1}</div>
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
