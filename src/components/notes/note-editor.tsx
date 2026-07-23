"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Cloud, Loader2, Users } from "lucide-react";
import { RichEditor } from "@/components/notes/rich-editor";
import { EmojiPicker } from "@/components/notes/emoji-picker";
import { PresenceBar } from "@/components/notes/presence-bar";
import type { Presence } from "@/components/notes/presence-utils";

type Status = "idle" | "saving" | "saved";
export type PageMeta = { title?: string; icon?: string };
type WorkspaceUser = { id: string; name: string };
type RemoteSnapshot = { title: string; icon: string; content: string; updatedAt: string };

const PRESENCE_INTERVAL_MS = 3000;

export function NoteEditor({ pageId, user, onMeta }: { pageId: string; user: WorkspaceUser; onMeta: (id: string, meta: PageMeta) => void }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📄");
  const [status, setStatus] = useState<Status>("idle");
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [remoteFlash, setRemoteFlash] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);
  const [editorHTML, setEditorHTML] = useState("");

  const values = useRef<{ title: string; icon: string; content: string }>({ title: "", icon: "📄", content: "" });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const updatedAtRef = useRef<string>("");    // server version of the content we currently hold
  const focusedRef = useRef(false);           // is the body being actively edited
  const pendingRemote = useRef<RemoteSnapshot | null>(null); // teammate change waiting until we're idle

  const growTitle = useCallback(() => {
    const el = titleRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
  }, []);

  const applyRemote = useCallback((remote: RemoteSnapshot) => {
    setTitle(remote.title);
    setIcon(remote.icon);
    setEditorHTML(remote.content);
    values.current = { title: remote.title, icon: remote.icon, content: remote.content };
    updatedAtRef.current = remote.updatedAt;
    dirty.current = false;
    pendingRemote.current = null;
    setContentVersion((v) => v + 1); // remounts the editor with the new body
    onMeta(pageId, { title: remote.title, icon: remote.icon });
    requestAnimationFrame(growTitle);
    setRemoteFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setRemoteFlash(false), 2200);
  }, [pageId, onMeta, growTitle]);

  // Load a page when it becomes active; flush any pending edits to the previous
  // page in the cleanup so switching never drops unsaved changes.
  useEffect(() => {
    let cancelled = false;
    const previousId = pageId;
    setLoaded(false);
    setNotFound(false);
    setPickerOpen(false);
    pendingRemote.current = null;
    fetch(`/api/notes/pages/${pageId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error || !d.page) { setNotFound(true); setLoaded(true); return; }
        setTitle(d.page.title);
        setIcon(d.page.icon);
        setEditorHTML(d.page.content ?? "");
        values.current = { title: d.page.title, icon: d.page.icon, content: d.page.content ?? "" };
        updatedAtRef.current = d.page.updatedAt ?? "";
        dirty.current = false;
        setStatus("idle");
        setLoaded(true);
        requestAnimationFrame(growTitle);
      })
      .catch(() => { if (!cancelled) { setNotFound(true); setLoaded(true); } });

    return () => {
      cancelled = true;
      if (timer.current) { clearTimeout(timer.current); timer.current = null; }
      if (dirty.current) {
        fetch(`/api/notes/pages/${previousId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values.current),
          keepalive: true,
        }).catch(() => {});
        dirty.current = false;
      }
    };
  }, [pageId, growTitle]);

  // Presence heartbeat + live sync loop.
  useEffect(() => {
    let stopped = false;
    const canApply = () => !focusedRef.current && !dirty.current;

    const tick = async () => {
      try {
        const res = await fetch("/api/notes/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, version: updatedAtRef.current }),
        });
        if (!res.ok || stopped) return;
        const data = await res.json();
        setPresence(Array.isArray(data.presence) ? data.presence : []);

        if (data.page?.changed) {
          const remote: RemoteSnapshot = { title: data.page.title, icon: data.page.icon, content: data.page.content, updatedAt: data.page.updatedAt };
          if (canApply()) applyRemote(remote);
          else pendingRemote.current = remote; // hold until the user stops typing
        } else if (pendingRemote.current && canApply()) {
          applyRemote(pendingRemote.current);
        }
      } catch {
        /* transient network hiccup — next tick retries */
      }
    };

    tick();
    const id = setInterval(tick, PRESENCE_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
      setPresence([]);
      fetch(`/api/notes/presence?pageId=${pageId}`, { method: "DELETE", keepalive: true }).catch(() => {});
    };
  }, [pageId, user.id, applyRemote]);

  const queueSave = useCallback(() => {
    dirty.current = true;
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values.current),
        });
        if (res.ok) {
          const d = await res.json().catch(() => null);
          if (d?.page?.updatedAt) updatedAtRef.current = d.page.updatedAt; // our write is the new baseline
          pendingRemote.current = null; // our save supersedes anything queued
          dirty.current = false;
          setStatus("saved");
        } else setStatus("idle");
      } catch { setStatus("idle"); }
    }, 700);
  }, [pageId]);

  const onTitle = (v: string) => {
    setTitle(v);
    values.current.title = v || "Untitled";
    onMeta(pageId, { title: values.current.title });
    growTitle();
    queueSave();
  };

  const onIcon = (v: string) => {
    setIcon(v);
    values.current.icon = v;
    onMeta(pageId, { icon: v });
    queueSave();
  };

  const onContent = useCallback((html: string) => {
    values.current.content = html;
    queueSave();
  }, [queueSave]);

  const onFocusChange = useCallback((focused: boolean) => { focusedRef.current = focused; }, []);

  if (notFound) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-400">This page could not be found.</div>;
  }

  if (!loaded) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
        <div className="h-9 w-2/3 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-900" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
      <div className="mb-4 flex h-6 items-center justify-between gap-3 text-xs text-zinc-400">
        <PresenceBar others={presence} />
        <span className="ml-auto flex items-center gap-1.5">
          {remoteFlash ? (
            <span className="flex items-center gap-1.5 text-[var(--accent)]"><Users className="h-3.5 w-3.5" /> Updated by teammate</span>
          ) : status === "saving" ? (
            <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>
          ) : status === "saved" ? (
            <span className="flex items-center gap-1.5 text-emerald-500"><Check className="h-3.5 w-3.5" /> Saved</span>
          ) : (
            <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5" /> All changes saved</span>
          )}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-3xl leading-none transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Change icon"
          >
            {icon}
          </button>
          {pickerOpen && <EmojiPicker onPick={onIcon} onClose={() => setPickerOpen(false)} />}
        </div>
        <textarea
          ref={titleRef}
          value={title}
          rows={1}
          onChange={(e) => onTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          placeholder="Untitled"
          className="mt-1 w-full resize-none border-none bg-transparent text-3xl font-bold leading-tight tracking-tight text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-50 dark:placeholder:text-zinc-700"
        />
      </div>

      <div className="mt-6">
        <RichEditor key={`${pageId}:${contentVersion}`} initialHTML={editorHTML} onChange={onContent} onFocusChange={onFocusChange} />
      </div>
    </div>
  );
}
