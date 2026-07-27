"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2, ShieldCheck, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type TeamUser = { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string };

const ROLE_OPTIONS = [
  { value: "OWNER", label: "Owner — full access" },
  { value: "DEV", label: "Developer — assigned work + shared notes" },
  { value: "MEMBER", label: "Agent — sales pipeline" },
];
const ROLE_LABEL: Record<string, string> = { OWNER: "Owner", DEV: "Developer", MEMBER: "Agent" };

function Credential({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-emerald-800 dark:text-emerald-300">Temporary password for {email}</p>
        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Copy it now — it won't be shown again. Share it securely; they can change it after logging in.</p>
      </div>
      <code className="rounded bg-white px-2 py-1 font-mono text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">{password}</code>
      <Button size="sm" variant="outline" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</Button>
      <button type="button" onClick={onClose} className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"><X className="h-4 w-4" /></button>
    </div>
  );
}

export function TeamManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", role: "DEV" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [credential, setCredential] = useState<{ email: string; password: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users ?? [])).catch(() => setUsers([])).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function addUser() {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setAdding(true); setError("");
    const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) { setError(data.error ?? "Could not add teammate."); return; }
    setUsers((prev) => [...prev, data.user].sort((a, b) => a.name.localeCompare(b.name)));
    setCredential({ email: data.user.email, password: data.tempPassword });
    setForm({ name: "", email: "", role: "DEV" });
  }

  async function patchUser(id: string, payload: Record<string, unknown>, optimistic?: (u: TeamUser) => TeamUser) {
    const prev = users;
    if (optimistic) setUsers((list) => list.map((u) => (u.id === id ? optimistic(u) : u)));
    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setBusyId("");
    if (!res.ok) { setUsers(prev); alert(data.error ?? "Update failed."); return null; }
    setUsers((list) => list.map((u) => (u.id === id ? data.user : u)));
    return data;
  }

  async function resetPassword(user: TeamUser) {
    if (!window.confirm(`Reset ${user.name}'s password? Their current login will stop working.`)) return;
    const data = await patchUser(user.id, { resetPassword: true });
    if (data?.tempPassword) setCredential({ email: user.email, password: data.tempPassword });
  }

  async function toggleActive(user: TeamUser) {
    if (user.isActive && !window.confirm(`Deactivate ${user.name}? They'll be signed out and can't log in until reactivated.`)) return;
    await patchUser(user.id, { isActive: !user.isActive }, (u) => ({ ...u, isActive: !u.isActive }));
  }

  return (
    <div className="space-y-6">
      {credential && <Credential email={credential.email} password={credential.password} onClose={() => setCredential(null)} />}

      <Card>
        <CardHeader><CardTitle>Add a teammate</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Luke Carter" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="luke@contractor.dev" /></div>
            <div className="space-y-1.5"><Label>Role</Label><Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>{ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</Select></div>
            <Button onClick={addUser} disabled={adding}>{adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}Add</Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-xs text-zinc-500">A temporary password is generated on the spot for you to share — no email needed.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Team ({users.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <div key={u.id} className={cn("flex flex-wrap items-center gap-3 py-3", !u.isActive && "opacity-60")}>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {u.name}
                      {u.id === currentUserId && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">You</span>}
                      {!u.isActive && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">Deactivated</span>}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{u.email}</p>
                  </div>
                  <Select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => patchUser(u.id, { role: e.target.value }, (x) => ({ ...x, role: e.target.value }))}
                    className="h-9 w-48"
                    title="Role"
                  >
                    {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{ROLE_LABEL[r.value]}</option>)}
                  </Select>
                  <Button size="sm" variant="outline" disabled={busyId === u.id} onClick={() => resetPassword(u)} title="Reset password">
                    <KeyRound className="h-4 w-4" /> Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === u.id || u.id === currentUserId}
                    onClick={() => toggleActive(u)}
                    className={cn(u.isActive ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40")}
                  >
                    {busyId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : u.isActive ? "Deactivate" : "Reactivate"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
