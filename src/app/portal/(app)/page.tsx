import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, FileText, MessageSquarePlus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function PortalDashboard() {
  const client = await getPortalSession();
  if (!client) redirect("/portal/login");

  const [invoices, requests, contracts] = await Promise.all([
    prisma.invoice.findMany({ where: { clientId: client.id }, orderBy: { dueDate: "asc" }, take: 3 }),
    prisma.workRequest.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.contract.findMany({ where: { clientId: client.id, status: "ACTIVE" }, take: 1 }),
  ]);

  const pendingInvoice = invoices.find((i) => i.status === "PENDING");
  const activeContract = contracts[0];
  const openRequests = requests.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Welcome back, {client.name.split(" ")[0]}</h1>
        <p className="mt-1 text-zinc-500">{client.businessName} · Your project hub</p>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Active Plan</p>
          {activeContract ? (
            <>
              <p className="mt-2 text-xl font-bold text-zinc-900">{activeContract.planName}</p>
              <p className="mt-1 text-sm text-indigo-600">${activeContract.total.toFixed(2)} / {activeContract.billingCycle.toLowerCase()}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">No active plan</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Next Payment</p>
          {pendingInvoice ? (
            <>
              <p className="mt-2 text-xl font-bold text-zinc-900">${pendingInvoice.amount.toFixed(2)}</p>
              <p className="mt-1 text-sm text-amber-600">Due {new Date(pendingInvoice.dueDate).toLocaleDateString()}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-green-600">All paid up ✓</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Open Requests</p>
          <p className="mt-2 text-xl font-bold text-zinc-900">{openRequests.length}</p>
          <p className="mt-1 text-sm text-zinc-500">{openRequests.length === 1 ? "request" : "requests"} in progress</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/portal/requests" className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">Submit a request</p>
              <p className="text-sm text-zinc-500">Send files, photos, or describe work needed</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-indigo-600 transition" />
        </Link>

        <Link href="/portal/invoices" className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">View invoices</p>
              <p className="text-sm text-zinc-500">Pay your bill and view history</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-amber-600 transition" />
        </Link>
      </div>

      {/* Recent requests */}
      {requests.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Recent requests</h2>
            <Link href="/portal/requests" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                {req.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" /> : <Clock className="h-5 w-5 shrink-0 text-amber-500" />}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-zinc-900">{req.title}</p>
                  <p className="text-xs text-zinc-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  req.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  req.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                  "bg-zinc-100 text-zinc-600"
                }`}>{req.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
