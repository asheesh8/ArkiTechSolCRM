"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Cloud, Loader2 } from "lucide-react";
import { RichEditor } from "@/components/notes/rich-editor";
import { EmojiPicker } from "@/components/notes/emoji-picker";

type Status = "idle" | "saving" | "saved";
export type PageMeta = { title?: string; icon?: string };

export function NoteEditor({ pageId, onMeta }: { pageId: string; onMeta: (id: string, meta: PageMeta) => void }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📄");
  const [status, setStatus] = useState<Status>("idle");
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const values = useRef<{ title: string; icon: string; content: string }>({ title: "", icon: "📄", content: "" });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const growTitle = useCallback(() => {
    const el = titleRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
  }, []);

  // Load a page when it becomes active; flush any pending edits to the previous
  // page in the cleanup so switching never drops unsaved changes.
  useEffect(() => {
    let cancelled = false;
    const previousId = pageId;
    setLoaded(false);
    setNotFound(false);
    setPickerOpen(false);
    fetch(`/api/notes/pages/${pageId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error || !d.page) { setNotFound(true); setLoaded(true); return; }
        setTitle(d.page.title);
        setIcon(d.page.icon);
        values.current = { title: d.page.title, icon: d.page.icon, content: d.page.content ?? "" };
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
        if (res.ok) { dirty.current = false; setStatus("saved"); }
        else setStatus("idle");
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
      <div className="mb-4 flex h-5 items-center justify-end text-xs text-zinc-400">
        {status === "saving" ? (
          <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>
        ) : status === "saved" ? (
          <span className="flex items-center gap-1.5 text-emerald-500"><Check className="h-3.5 w-3.5" /> Saved</span>
        ) : (
          <span className="flex items-center gap-1.5"><Cloud className="h-3.5 w-3.5" /> All changes saved</span>
        )}
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
        <RichEditor key={pageId} initialHTML={values.current.content} onChange={onContent} />
      </div>
    </div>
  );
}
