import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, FileSignature, MessageSquarePlus, Paperclip, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-zinc-100 text-zinc-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

function formatStatus(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}

export default async function PortalDashboard() {
  const client = await getPortalSession();
  if (!client) redirect("/portal/login");

  const [requests, contracts] = await Promise.all([
    prisma.workRequest.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 4, include: { files: true } }),
    prisma.contract.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const activeContract = contracts.find((c) => c.status === "ACTIVE" || c.status === "SIGNED") ?? contracts[0];
  const openRequests = requests.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS" || r.status === "REVIEW");
  const firstName = client.name.split(" ")[0] || client.name;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-zinc-950 px-6 py-8 text-white">
          <p className="text-sm font-medium text-indigo-200">ArkiTech Client Portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{client.businessName} has one clean place for agreements, requests, files, and project updates.</p>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Agreement</p>
            <p className="mt-2 text-lg font-bold text-zinc-900">{activeContract?.planName ?? "Preparing agreement"}</p>
            <p className="mt-1 text-sm text-zinc-500">{activeContract ? formatStatus(activeContract.status) : "ArkiTech will send this shortly"}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Open Work</p>
            <p className="mt-2 text-lg font-bold text-zinc-900">{openRequests.length}</p>
            <p className="mt-1 text-sm text-zinc-500">Active request{openRequests.length === 1 ? "" : "s"} with the team</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Best Next Step</p>
            <p className="mt-2 text-lg font-bold text-zinc-900">{openRequests.length ? "Watch updates" : "Submit a request"}</p>
            <p className="mt-1 text-sm text-zinc-500">Keep everything out of scattered email threads</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/portal/requests" className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <MessageSquarePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900">Submit a request</p>
              <p className="text-sm text-zinc-500">Send files, photos, revisions, and project notes</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:text-indigo-600" />
        </Link>

        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900">One source of truth</p>
            <p className="text-sm text-zinc-500">Every request stays attached to your business profile</p>
          </div>
        </div>
      </div>

      {activeContract && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Agreement status</h2>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-900">{activeContract.planName}</p>
                <p className="mt-1 text-sm text-zinc-500">{activeContract.notes ?? "Your signed terms and scope stay on file with ArkiTech."}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">{formatStatus(activeContract.status)}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-zinc-500">{activeContract.signedAt ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />} Client signature</p>
              <p className="flex items-center gap-2 text-zinc-500">{activeContract.providerSignedAt ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4 text-amber-500" />} ArkiTech countersignature</p>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900">Recent requests</h2>
          <Link href="/portal/requests" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-12 text-center">
            <p className="font-medium text-zinc-700">No requests yet</p>
            <p className="mt-1 text-sm text-zinc-400">Create your first request when you need a change, upload, or update.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                {req.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> : <Clock className="h-5 w-5 shrink-0 text-amber-500" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900">{req.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{new Date(req.createdAt).toLocaleDateString()} {req.files.length > 0 && <span>· <Paperclip className="inline h-3 w-3" /> {req.files.length}</span>}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[req.status] ?? STATUS_STYLE.OPEN}`}>{formatStatus(req.status)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
