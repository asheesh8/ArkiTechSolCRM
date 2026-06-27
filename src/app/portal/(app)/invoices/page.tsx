"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Loader2, XCircle } from "lucide-react";

type Invoice = {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  description: string | null;
};

function statusBadge(status: string) {
  if (status === "PAID") return <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"><CheckCircle2 className="h-3.5 w-3.5" /> Paid</span>;
  if (status === "OVERDUE") return <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700"><XCircle className="h-3.5 w-3.5" /> Overdue</span>;
  return <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"><Clock className="h-3.5 w-3.5" /> Pending</span>;
}

function InvoicesContent() {
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function pay(invoiceId: string) {
    setPayingId(invoiceId);
    const res = await fetch(`/api/invoices/${invoiceId}/pay`, { method: "POST" });
    const data = await res.json();
    setPayingId(null);
    if (data.url) window.location.href = data.url;
  }

  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
  const history = invoices.filter((i) => i.status === "PAID" || i.status === "CANCELLED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Invoices & Billing</h1>
        <p className="mt-1 text-sm text-zinc-500">View and pay your invoices securely via Stripe.</p>
      </div>

      {paid && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Payment successful!</p>
            <p className="text-sm text-green-700">Your payment was processed. You'll receive a confirmation email shortly.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center">
          <p className="text-zinc-500">No invoices yet</p>
          <p className="mt-1 text-sm text-zinc-400">Invoices will appear here when they are created.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold text-zinc-900">Due now</h2>
              <div className="space-y-3">
                {pending.map((inv) => (
                  <div key={inv.id} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-zinc-900">${inv.amount.toFixed(2)}</p>
                        {statusBadge(inv.status)}
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{inv.description ?? "ArkiTech Services"}</p>
                      <p className="mt-1 text-xs text-zinc-400">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => pay(inv.id)}
                      disabled={payingId === inv.id}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition whitespace-nowrap"
                    >
                      {payingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      {payingId === inv.id ? "Redirecting…" : "Pay now"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold text-zinc-900">Payment history</h2>
              <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                {history.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium text-zinc-900">${inv.amount.toFixed(2)}</p>
                      <p className="text-xs text-zinc-400">{inv.description ?? "ArkiTech Services"} · {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                    {statusBadge(inv.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 rounded-2xl bg-zinc-100" />}>
      <InvoicesContent />
    </Suspense>
  );
}
