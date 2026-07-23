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

const PRESENCE_INTERVAL_MS = 1000;
const SAVE_FLUSH_MS = 150;
const LOCAL_EDIT_QUIET_MS = 450;

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
  const pendingApplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInFlight = useRef(false);
  const saveQueued = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const activePageRef = useRef(pageId);
  const updatedAtRef = useRef<string>("");    // server version of the content we currently hold
  const localEditQuietUntil = useRef(0);
  const pendingRemote = useRef<RemoteSnapshot | null>(null); // teammate change waiting until we're idle
  const flushSaveRef = useRef<(() => Promise<void>) | null>(null);

  const growTitle = useCallback(() => {
    const el = titleRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
  }, []);

  const applyRemote = useCallback((remote: RemoteSnapshot) => {
    if (remote.updatedAt === updatedAtRef.current) return;
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

  const canApplyRemote = useCallback(() => (
    !dirty.current && !saveInFlight.current && Date.now() >= localEditQuietUntil.current
  ), []);

  const schedulePendingApply = useCallback(() => {
    if (pendingApplyTimer.current) clearTimeout(pendingApplyTimer.current);
    const delay = Math.max(0, localEditQuietUntil.current - Date.now()) + 40;
    pendingApplyTimer.current = setTimeout(() => {
      if (pendingRemote.current && canApplyRemote()) applyRemote(pendingRemote.current);
    }, delay);
  }, [applyRemote, canApplyRemote]);

  const handleRemote = useCallback((remote: RemoteSnapshot) => {
    if (remote.updatedAt === updatedAtRef.current) return;
    if (canApplyRemote()) applyRemote(remote);
    else {
      pendingRemote.current = remote;
      schedulePendingApply();
    }
  }, [applyRemote, canApplyRemote, schedulePendingApply]);

  const markLocalEdit = useCallback(() => {
    localEditQuietUntil.current = Date.now() + LOCAL_EDIT_QUIET_MS;
  }, []);

  // Load a page when it becomes active; flush any pending edits to the previous
  // page in the cleanup so switching never drops unsaved changes.
  useEffect(() => {
    let cancelled = false;
    const previousId = pageId;
    activePageRef.current = pageId;
    setLoaded(false);
    setNotFound(false);
    setPickerOpen(false);
    localEditQuietUntil.current = 0;
    pendingRemote.current = null;
    if (pendingApplyTimer.current) { clearTimeout(pendingApplyTimer.current); pendingApplyTimer.current = null; }
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
      if (pendingApplyTimer.current) { clearTimeout(pendingApplyTimer.current); pendingApplyTimer.current = null; }
      if (dirty.current) {
        fetch(`/api/notes/pages/${previousId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values.current),
          keepalive: true,
        }).catch(() => {});
        dirty.current = false;
        saveQueued.current = false;
      }
    };
  }, [pageId, growTitle]);

  // Realtime page stream. Same-instance saves arrive immediately; the server
  // route also polls briefly as a cross-instance fallback.
  useEffect(() => {
    if (!loaded || notFound) return;

    const source = new EventSource(`/api/notes/pages/${pageId}/events?version=${encodeURIComponent(updatedAtRef.current)}`);
    const onPage = (event: Event) => {
      try {
        const data = JSON.parse((event as MessageEvent<string>).data) as { actorId?: string | null; page?: RemoteSnapshot };
        if (!data.page || data.actorId === user.id) return;
        handleRemote(data.page);
      } catch {
        /* malformed stream event — EventSource reconnects if needed */
      }
    };

    source.addEventListener("page", onPage);
    return () => source.close();
  }, [handleRemote, loaded, notFound, pageId, user.id]);

  // Presence heartbeat + fallback live sync loop.
  useEffect(() => {
    let stopped = false;

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
          handleRemote(remote);
        } else if (pendingRemote.current) {
          schedulePendingApply();
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
  }, [pageId, schedulePendingApply, handleRemote]);

  const flushSave = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (!saveQueued.current) return;

    saveQueued.current = false;
    saveInFlight.current = true;
    const payload = { ...values.current };

    try {
      const res = await fetch(`/api/notes/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const d = await res.json().catch(() => null);
        if (activePageRef.current === pageId && d?.page?.updatedAt) updatedAtRef.current = d.page.updatedAt;
        pendingRemote.current = null; // our save is the latest last-write-wins baseline
        if (!saveQueued.current) {
          dirty.current = false;
          setStatus("saved");
        }
      } else if (!saveQueued.current) {
        setStatus("idle");
      }
    } catch {
      if (!saveQueued.current) setStatus("idle");
    } finally {
      saveInFlight.current = false;
      if (saveQueued.current) {
        timer.current = setTimeout(() => { void flushSaveRef.current?.(); }, SAVE_FLUSH_MS);
      } else {
        schedulePendingApply();
      }
    }
  }, [pageId, schedulePendingApply]);

  useEffect(() => {
    flushSaveRef.current = flushSave;
  }, [flushSave]);

  const queueSave = useCallback(() => {
    markLocalEdit();
    dirty.current = true;
    saveQueued.current = true;
    setStatus("saving");
    if (timer.current || saveInFlight.current) return;
    timer.current = setTimeout(() => { void flushSaveRef.current?.(); }, SAVE_FLUSH_MS);
  }, [markLocalEdit]);

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
        <RichEditor key={`${pageId}:${contentVersion}`} initialHTML={editorHTML} onChange={onContent} />
      </div>
    </div>
  );
}
