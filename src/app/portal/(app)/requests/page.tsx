"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Loader2, Paperclip, Plus, Send, Trash2, X } from "lucide-react";

type WorkFile = { id: string; name: string; r2Key: string; size: string; mimeType: string | null };
type WorkRequest = { id: string; title: string; description: string | null; status: string; createdAt: string; files: WorkFile[] };

const MAX_DISPLAY_SIZE = 1024 * 1024 * 1024; // 1 GB display cap for label

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/portal/work-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .finally(() => setLoading(false));
  }, []);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  }

  function removeFile(idx: number) { setFiles((prev) => prev.filter((_, i) => i !== idx)); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    // Create the request
    const res = await fetch("/api/portal/work-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc || null }),
    });
    const data = await res.json();
    if (!res.ok) { setSubmitting(false); return; }
    const requestId: string = data.request.id;

    // Upload files to R2 using presigned URLs
    for (const file of files) {
      const urlRes = await fetch("/api/portal/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }),
      });
      const { uploadUrl, key } = await urlRes.json();

      // XHR so we can track progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadProgress((p) => ({ ...p, [file.name]: Math.round((ev.loaded / ev.total) * 100) }));
        };
        xhr.onload = () => resolve();
        xhr.onerror = () => reject();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // Register file record
      await fetch(`/api/portal/work-requests/${requestId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, r2Key: key, size: file.size, mimeType: file.type || null }),
      });
    }

    const newReq: WorkRequest = { ...data.request, files: [] };
    setRequests((prev) => [newReq, ...prev]);
    setTitle("");
    setDesc("");
    setFiles([]);
    setUploadProgress({});
    setShowForm(false);
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Work Requests</h1>
          <p className="mt-1 text-sm text-zinc-500">Submit requests, share files, and track progress — no email needed.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            <Plus className="h-4 w-4" /> New request
          </button>
        )}
      </div>

      {/* New request form */}
      {showForm && (
        <form onSubmit={submit} className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">New request</h2>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">What do you need?</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Update homepage banner image"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Details <span className="font-normal text-zinc-400">(optional)</span></label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Any extra context, links, or instructions…"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* File drop area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="mx-auto mb-2 h-6 w-6 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-600">Drop files here or click to browse</p>
            <p className="mt-1 text-xs text-zinc-400">Photos, videos, PDFs — any size, no limits</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </div>

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2">
                  <Paperclip className="h-4 w-4 shrink-0 text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800">{f.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-zinc-400">{formatSize(f.size)}</p>
                      {uploadProgress[f.name] != null && (
                        <div className="flex-1 h-1.5 rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress[f.name]}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                  {!submitting && (
                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 rounded p-1 text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Submit request"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition">Cancel</button>
          </div>
        </form>
      )}

      {/* Request list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center">
          <p className="text-zinc-500">No requests yet</p>
          <p className="mt-1 text-sm text-zinc-400">Hit "New request" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {req.status === "COMPLETED" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /> : <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />}
                  <div>
                    <p className="font-semibold text-zinc-900">{req.title}</p>
                    {req.description && <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{req.description}</p>}
                    <p className="mt-2 text-xs text-zinc-400">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                  req.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  req.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                  req.status === "REVIEW" ? "bg-purple-100 text-purple-700" :
                  "bg-zinc-100 text-zinc-600"
                }`}>{req.status.replace("_", " ")}</span>
              </div>
              {req.files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 pl-8">
                  {req.files.map((f) => (
                    <span key={f.id} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600">
                      <Paperclip className="h-3 w-3" /> {f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
