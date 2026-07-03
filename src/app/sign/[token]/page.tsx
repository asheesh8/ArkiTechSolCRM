"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Loader2, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Contract = {
  id: string;
  planName: string;
  lineItems: Array<{ description: string; amount: number }>;
  subtotal: number;
  tax: number;
  total: number;
  billingCycle: string;
  notes: string | null;
  status: string;
  signedAt: string | null;
  documentKey: string | null;
  documentName: string | null;
  providerSignatureData: string | null;
  providerName: string | null;
  providerSignedAt: string | null;
  client: { name: string; email: string; businessName: string };
};

export default function SignPage() {
  const { token } = useParams<{ token: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [signMethod, setSignMethod] = useState<"type" | "draw">("type");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else { setContract(d.contract); if (d.contract.status === "SIGNED") setSigned(true); }
      });
  }, [token]);

  // Canvas draw handlers
  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#18181b";
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function stopDraw() { drawing.current = false; }
  function clearCanvas() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
  }
  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  async function submitSignature() {
    let signatureData: string;
    if (signMethod === "draw") {
      const canvas = canvasRef.current!;
      signatureData = canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) return;
      signatureData = `typed:${typedName.trim()}`;
    }
    setSigning(true);
    const res = await fetch(`/api/sign/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureData }),
    });
    const data = await res.json();
    setSigning(false);
    if (!res.ok) { setError(data.error ?? "Could not sign"); return; }
    setSigned(true);
  }

  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600"><X className="h-7 w-7" /></div>
        <h1 className="text-xl font-semibold text-zinc-900">Link unavailable</h1>
        <p className="mt-2 text-zinc-500">{error}</p>
      </div>
    </div>
  );

  if (!contract) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
    </div>
  );

  if (signed) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600"><Check className="h-7 w-7" /></div>
        <h1 className="text-2xl font-bold text-zinc-900">Agreement signed!</h1>
        <p className="mt-2 text-zinc-500">Thank you, {contract.client.name}. You'll receive a confirmation email shortly. We're excited to work with you.</p>
        <p className="mt-6 text-sm text-zinc-400">You can close this tab.</p>
      </div>
    </div>
  );

  const cycle = contract.billingCycle.charAt(0) + contract.billingCycle.slice(1).toLowerCase();

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-600">ArkiTech Solutions</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">Service Agreement</h1>
          </div>
          <div className="text-right text-sm text-zinc-500">
            <p className="font-medium text-zinc-800">{contract.client.businessName}</p>
            <p>{contract.client.name}</p>
          </div>
        </div>

        {/* Contract body */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-6">
            <h2 className="text-lg font-semibold text-zinc-900">{contract.planName}</h2>
            <p className="mt-1 text-sm text-zinc-500">{cycle} service agreement between ArkiTech Solutions and {contract.client.businessName}</p>
          </div>

          <div className="p-6">
            {contract.documentKey ? (
              <>
                <h3 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  <span>Contract Document</span>
                  <a
                    href={`/api/sign/${token}/document`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium normal-case text-indigo-600 hover:text-indigo-700"
                  >
                    Open in new tab ↗
                  </a>
                </h3>
                <object
                  data={`/api/sign/${token}/document`}
                  type="application/pdf"
                  className="h-[600px] w-full rounded-lg border border-zinc-200"
                >
                  <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-zinc-500">
                    <p>{contract.documentName ?? "Contract document"}</p>
                    <a href={`/api/sign/${token}/document`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-700">
                      View document ↗
                    </a>
                  </div>
                </object>
                {contract.total > 0 && (
                  <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-base font-bold text-zinc-900">
                    <span>Total {cycle}</span><span>${contract.total.toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Scope of Services</h3>
                <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                  {(contract.lineItems as Array<{ description: string; amount: number }>).map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-zinc-700">{item.description}</span>
                      <span className="text-sm font-medium text-zinc-900">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-right text-sm">
                  <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>${contract.subtotal.toFixed(2)}</span></div>
                  {contract.tax > 0 && <div className="flex justify-between text-zinc-500"><span>Tax</span><span>${contract.tax.toFixed(2)}</span></div>}
                  <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900"><span>Total {cycle}</span><span>${contract.total.toFixed(2)}</span></div>
                </div>
              </>
            )}
          </div>

          {contract.notes && (
            <div className="border-t border-zinc-100 bg-zinc-50 p-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Additional Terms</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{contract.notes}</p>
            </div>
          )}

          <div className="border-t border-zinc-100 bg-zinc-50 p-6">
            <p className="text-sm leading-relaxed text-zinc-600">
              By signing below, you agree to the services and pricing described above. ArkiTech Solutions agrees to deliver the described services
              in a professional and timely manner. Either party may cancel with 30 days written notice.
            </p>
          </div>

          {/* Provider counter-signature (shown once ArkiTech has signed) */}
          {contract.providerSignatureData && (
            <div className="border-t border-zinc-100 bg-emerald-50/50 p-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Signed by ArkiTech Solutions</h3>
              <div className="flex items-center justify-between gap-4">
                {contract.providerSignatureData.startsWith("typed:") ? (
                  <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-3xl text-zinc-900">{contract.providerSignatureData.slice(6)}</span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={contract.providerSignatureData} alt="ArkiTech signature" className="h-14 w-auto object-contain" />
                )}
                <span className="text-xs text-zinc-500">{contract.providerName ?? "ArkiTech Solutions"}{contract.providerSignedAt ? ` · ${new Date(contract.providerSignedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}` : ""}</span>
              </div>
            </div>
          )}

          {/* Signature area */}
          <div className="border-t border-zinc-200 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              <PenLine className="h-4 w-4" /> Your Signature
            </h3>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setSignMethod("type")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${signMethod === "type" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
              >
                Type name
              </button>
              <button
                type="button"
                onClick={() => setSignMethod("draw")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${signMethod === "draw" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
              >
                Draw signature
              </button>
            </div>

            {signMethod === "type" ? (
              <input
                type="text"
                placeholder="Type your full name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                style={{ fontFamily: "'Dancing Script', cursive", fontSize: 28 }}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            ) : (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={120}
                  className="w-full rounded-xl border border-zinc-300 bg-white touch-none"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
                <button type="button" onClick={clearCanvas} className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600">Clear</button>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={submitSignature}
                disabled={signing || (signMethod === "type" && !typedName.trim())}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {signing ? "Submitting…" : "Sign & agree"}
              </Button>
              <p className="text-xs text-zinc-400">By signing you agree to the terms above.</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">ArkiTech Solutions · Burlington, VT · Secured signing link</p>
      </div>
    </div>
  );
}
