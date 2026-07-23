"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  ChevronDown, ChevronRight, FolderPlus, Loader2, MoreHorizontal, PanelLeftClose,
  PanelLeftOpen, Plus, Search, Trash2, X,
} from "lucide-react";
import { NoteEditor, type PageMeta } from "@/components/notes/note-editor";
import { EmojiPicker } from "@/components/notes/emoji-picker";
import { cn } from "@/lib/utils";

type FlatPage = { id: string; title: string; icon: string; parentId: string | null; sortOrder: number; updatedAt?: string };
type Cabinet = { id: string; name: string; icon: string; color: string; sortOrder: number; pages: FlatPage[] };
type DropPosition = "before" | "inside" | "after";
type DropTarget =
  | { kind: "page"; pageId: string; cabinetId: string; position: DropPosition }
  | { kind: "cabinet"; cabinetId: string };
type MoveDestination = { cabinetId: string; parentId: string | null; index: number };

const COLORS: Record<string, { chip: string; dot: string }> = {
  blue: { chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", dot: "bg-blue-500" },
  violet: { chip: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300", dot: "bg-violet-500" },
  emerald: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", dot: "bg-emerald-500" },
  amber: { chip: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", dot: "bg-amber-500" },
  rose: { chip: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300", dot: "bg-rose-500" },
  sky: { chip: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300", dot: "bg-sky-500" },
  slate: { chip: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300", dot: "bg-slate-500" },
};
const COLOR_KEYS = Object.keys(COLORS);
const STORAGE_KEY = "locallead-note-page";
const TREE_SYNC_INTERVAL_MS = 5000;

function descendantIds(pages: FlatPage[], id: string): string[] {
  const out = [id];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const p of pages) if (p.parentId === cur) { out.push(p.id); stack.push(p.id); }
  }
  return out;
}

function findPageCabinet(cabinets: Cabinet[], pageId: string) {
  return cabinets.find((cab) => cab.pages.some((p) => p.id === pageId)) ?? null;
}

function sortedChildren(pages: FlatPage[], parentId: string | null) {
  return pages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => page.parentId === parentId)
    .sort((a, b) => a.page.sortOrder - b.page.sortOrder || a.index - b.index)
    .map(({ page }) => page);
}

function expandPath(cabinet: Cabinet, pageId: string) {
  const exp = new Set<string>([cabinet.id]);
  let cur = cabinet.pages.find((p) => p.id === pageId);
  const seen = new Set<string>();
  while (cur?.parentId && !seen.has(cur.id)) {
    seen.add(cur.id);
    exp.add(cur.parentId);
    cur = cabinet.pages.find((p) => p.id === cur?.parentId);
  }
  return exp;
}

function sameDropTarget(a: DropTarget | null, b: DropTarget | null) {
  if (!a || !b) return a === b;
  if (a.kind !== b.kind || a.cabinetId !== b.cabinetId) return false;
  if (a.kind === "cabinet" || b.kind === "cabinet") return true;
  return a.pageId === b.pageId && a.position === b.position;
}

function movePageInTree(cabinets: Cabinet[], pageId: string, destination: MoveDestination) {
  const sourceCabinet = findPageCabinet(cabinets, pageId);
  const targetCabinet = cabinets.find((cab) => cab.id === destination.cabinetId);
  if (!sourceCabinet || !targetCabinet) return cabinets;

  const movingIds = new Set(descendantIds(sourceCabinet.pages, pageId));
  if (destination.parentId && movingIds.has(destination.parentId)) return cabinets;

  const movingPages = sourceCabinet.pages
    .filter((page) => movingIds.has(page.id))
    .map((page) => page.id === pageId ? { ...page, parentId: destination.parentId } : page);

  const normalizeGroup = (pages: FlatPage[], parentId: string | null) => {
    const order = new Map(sortedChildren(pages, parentId).map((page, i) => [page.id, i]));
    return pages.map((page) => order.has(page.id) ? { ...page, sortOrder: order.get(page.id)! } : page);
  };

  return cabinets.map((cab) => {
    let pages = cab.pages.filter((page) => !movingIds.has(page.id));
    if (cab.id === sourceCabinet.id && (sourceCabinet.id !== destination.cabinetId || sourceCabinet.pages.find((p) => p.id === pageId)?.parentId !== destination.parentId)) {
      pages = normalizeGroup(pages, sourceCabinet.pages.find((p) => p.id === pageId)?.parentId ?? null);
    }

    if (cab.id !== destination.cabinetId) return { ...cab, pages };

    pages = [...pages, ...movingPages];
    const siblings = sortedChildren(pages, destination.parentId).filter((page) => page.id !== pageId);
    const index = Math.max(0, Math.min(destination.index, siblings.length));
    const ordered = [...siblings.slice(0, index), movingPages.find((page) => page.id === pageId)!, ...siblings.slice(index)];
    const order = new Map(ordered.map((page, i) => [page.id, i]));
    pages = pages.map((page) => order.has(page.id) ? { ...page, sortOrder: order.get(page.id)! } : page);
    return { ...cab, pages };
  });
}

export function NotesWorkspace({ user }: { user: { id: string; name: string } }) {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rename, setRename] = useState<{ id: string; kind: "cabinet" | "page" } | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [iconFor, setIconFor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [treeOpen, setTreeOpen] = useState(true);
  const [draggingPageId, setDraggingPageId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const renameValue = useRef("");
  const dropTargetRef = useRef<DropTarget | null>(null);

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const expand = (id: string) => setExpanded((prev) => new Set(prev).add(id));

  const syncCabinets = useCallback(async () => {
    const res = await fetch("/api/notes/cabinets");
    if (!res.ok) return;
    const d = await res.json();
    const list: Cabinet[] = d.cabinets ?? [];
    setCabinets(list);
    setSelectedId((current) => {
      if (current && findPageCabinet(list, current)) return current;
      const next = list[0]?.pages[0]?.id ?? null;
      if (next) {
        try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
        const cab = findPageCabinet(list, next);
        if (cab) setExpanded((prev) => new Set([...prev, ...expandPath(cab, next)]));
      }
      return next;
    });
  }, []);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    try { window.localStorage.setItem(STORAGE_KEY, id); } catch {}
    if (window.innerWidth < 1024) setTreeOpen(false);
  }, []);

  // Initial load — restore the last-open page and expand its cabinet/ancestors.
  useEffect(() => {
    fetch("/api/notes/cabinets")
      .then((r) => r.json())
      .then((d) => {
        const list: Cabinet[] = d.cabinets ?? [];
        setCabinets(list);
        const saved = (() => { try { return window.localStorage.getItem(STORAGE_KEY); } catch { return null; } })();
        const exp = new Set<string>();
        let target: string | null = null;
        for (const cab of list) {
          if (saved && cab.pages.some((p) => p.id === saved)) {
            exp.add(cab.id);
            let cur = cab.pages.find((p) => p.id === saved)!;
            while (cur.parentId) { exp.add(cur.parentId); cur = cab.pages.find((p) => p.id === cur.parentId) ?? cur; if (cur.id === cur.parentId) break; }
            target = saved;
          }
        }
        if (!target && list[0]) { exp.add(list[0].id); target = list[0].pages[0]?.id ?? null; }
        setExpanded(exp);
        setSelectedId(target);
      })
      .catch(() => setCabinets([]))
      .finally(() => setLoading(false));
  }, []);

  // Keep the sidebar tree fresh when teammates add, rename, or delete pages.
  useEffect(() => {
    if (loading) return;
    const id = setInterval(() => {
      if (!rename) syncCabinets().catch(() => {});
    }, TREE_SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loading, rename, syncCabinets]);

  const createCabinet = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/notes/cabinets", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const { cabinet } = await res.json();
      if (cabinet) {
        setCabinets((prev) => [...prev, cabinet]);
        expand(cabinet.id);
        if (cabinet.pages?.[0]) select(cabinet.pages[0].id);
        setRename({ id: cabinet.id, kind: "cabinet" });
        renameValue.current = cabinet.name;
      }
    } finally { setBusy(false); }
  };

  const createPage = async (cabinetId: string, parentId: string | null = null) => {
    const res = await fetch("/api/notes/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cabinetId, parentId }) });
    const { page } = await res.json();
    if (!page) return;
    setCabinets((prev) => prev.map((c) => c.id === cabinetId ? { ...c, pages: [...c.pages, page] } : c));
    if (parentId) expand(parentId);
    expand(cabinetId);
    select(page.id);
  };

  const patchCabinet = async (id: string, data: Partial<Pick<Cabinet, "name" | "icon" | "color">>) => {
    setCabinets((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
    await fetch(`/api/notes/cabinets/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => {});
  };

  const patchPage = async (cabinetId: string, id: string, data: Partial<Pick<FlatPage, "title" | "icon">>) => {
    setCabinets((prev) => prev.map((c) => c.id === cabinetId ? { ...c, pages: c.pages.map((p) => p.id === id ? { ...p, ...data } : p) } : c));
    await fetch(`/api/notes/pages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => {});
  };

  const setDropTargetIfChanged = useCallback((target: DropTarget | null) => {
    dropTargetRef.current = target;
    setDropTarget((prev) => sameDropTarget(prev, target) ? prev : target);
  }, []);

  const destinationForDrop = useCallback((target: DropTarget): MoveDestination | null => {
    if (!draggingPageId) return null;
    const sourceCab = findPageCabinet(cabinets, draggingPageId);
    if (!sourceCab) return null;
    const movingIds = new Set(descendantIds(sourceCab.pages, draggingPageId));

    if (target.kind === "cabinet") {
      const cab = cabinets.find((c) => c.id === target.cabinetId);
      if (!cab) return null;
      return { cabinetId: cab.id, parentId: null, index: sortedChildren(cab.pages, null).filter((p) => p.id !== draggingPageId).length };
    }

    const cab = cabinets.find((c) => c.id === target.cabinetId);
    const targetPage = cab?.pages.find((p) => p.id === target.pageId);
    if (!cab || !targetPage || movingIds.has(targetPage.id)) return null;

    const parentId = target.position === "inside" ? targetPage.id : targetPage.parentId;
    if (parentId && movingIds.has(parentId)) return null;

    const siblings = sortedChildren(cab.pages, parentId).filter((p) => p.id !== draggingPageId);
    if (target.position === "inside") return { cabinetId: cab.id, parentId, index: siblings.length };

    const targetIndex = siblings.findIndex((p) => p.id === targetPage.id);
    if (targetIndex === -1) return null;
    return { cabinetId: cab.id, parentId, index: targetIndex + (target.position === "after" ? 1 : 0) };
  }, [cabinets, draggingPageId]);

  const positionFromDrag = (event: DragEvent<HTMLDivElement>): DropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    if (y < rect.height * 0.28) return "before";
    if (y > rect.height * 0.72) return "after";
    return "inside";
  };

  const commitPageMove = useCallback(async (target: DropTarget | null) => {
    if (!draggingPageId || !target) return;
    const destination = destinationForDrop(target);
    if (!destination) return;

    const movedPageId = draggingPageId;
    const previous = cabinets;
    setCabinets((prev) => movePageInTree(prev, movedPageId, destination));
    setExpanded((prev) => {
      const next = new Set(prev).add(destination.cabinetId);
      if (destination.parentId) next.add(destination.parentId);
      return next;
    });

    try {
      const res = await fetch(`/api/notes/pages/${movedPageId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destination),
      });
      if (!res.ok) throw new Error("Move failed");
      await syncCabinets();
    } catch {
      setCabinets(previous);
    } finally {
      setDraggingPageId(null);
      dropTargetRef.current = null;
      setDropTarget(null);
    }
  }, [cabinets, destinationForDrop, draggingPageId, syncCabinets]);

  const onPageDragStart = (event: DragEvent<HTMLDivElement>, pageId: string) => {
    if (rename?.id === pageId) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", pageId);
    setDraggingPageId(pageId);
    dropTargetRef.current = null;
    setDropTarget(null);
  };

  const onPageDragOver = (event: DragEvent<HTMLDivElement>, cabinetId: string, pageId: string) => {
    if (!draggingPageId) return;
    const position = positionFromDrag(event);
    const target: DropTarget = { kind: "page", cabinetId, pageId, position };
    if (!destinationForDrop(target)) {
      setDropTargetIfChanged(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetIfChanged(target);
    if (position === "inside") expand(pageId);
  };

  const onCabinetDragOver = (event: DragEvent<HTMLDivElement>, cabinetId: string) => {
    if (!draggingPageId) return;
    const target: DropTarget = { kind: "cabinet", cabinetId };
    if (!destinationForDrop(target)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetIfChanged(target);
    expand(cabinetId);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void commitPageMove(dropTargetRef.current);
  };

  const onDragEnd = () => {
    setDraggingPageId(null);
    dropTargetRef.current = null;
    setDropTarget(null);
  };

  const deleteCabinet = async (id: string) => {
    const cab = cabinets.find((c) => c.id === id);
    if (!cab) return;
    if (!window.confirm(`Delete “${cab.name}” and all ${cab.pages.length} page(s) inside it? This cannot be undone.`)) return;
    setMenuFor(null);
    const removedIds = new Set(cab.pages.map((p) => p.id));
    setCabinets((prev) => prev.filter((c) => c.id !== id));
    if (selectedId && removedIds.has(selectedId)) setSelectedId(null);
    await fetch(`/api/notes/cabinets/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const deletePage = async (cabinetId: string, id: string) => {
    const cab = cabinets.find((c) => c.id === cabinetId);
    if (!cab) return;
    const toRemove = new Set(descendantIds(cab.pages, id));
    const label = cab.pages.find((p) => p.id === id)?.title ?? "this page";
    if (!window.confirm(toRemove.size > 1 ? `Delete “${label}” and its ${toRemove.size - 1} sub-page(s)?` : `Delete “${label}”?`)) return;
    setCabinets((prev) => prev.map((c) => c.id === cabinetId ? { ...c, pages: c.pages.filter((p) => !toRemove.has(p.id)) } : c));
    if (selectedId && toRemove.has(selectedId)) {
      const remaining = cab.pages.filter((p) => !toRemove.has(p.id))[0]?.id ?? null;
      setSelectedId(remaining);
    }
    await fetch(`/api/notes/pages/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const onEditorMeta = useCallback((id: string, meta: PageMeta) => {
    setCabinets((prev) => prev.map((c) => ({ ...c, pages: c.pages.map((p) => p.id === id ? { ...p, ...meta } : p) })));
  }, []);

  const commitRename = () => {
    if (!rename) return;
    const value = renameValue.current.trim();
    if (rename.kind === "cabinet") { if (value) patchCabinet(rename.id, { name: value }); }
    else {
      const cab = cabinets.find((c) => c.pages.some((p) => p.id === rename.id));
      if (cab && value) patchPage(cab.id, rename.id, { title: value });
    }
    setRename(null);
  };

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hits: Array<{ cabinet: Cabinet; page: FlatPage }> = [];
    for (const cab of cabinets) for (const p of cab.pages) if (p.title.toLowerCase().includes(q)) hits.push({ cabinet: cab, page: p });
    return hits;
  }, [query, cabinets]);

  function RenameInput({ initial }: { initial: string }) {
    return (
      <input
        autoFocus
        defaultValue={initial}
        onFocus={(e) => { e.target.select(); renameValue.current = initial; }}
        onChange={(e) => { renameValue.current = e.target.value; }}
        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRename(null); }}
        onBlur={commitRename}
        className="w-full rounded-md border border-[var(--accent)] bg-white px-1.5 py-0.5 text-sm outline-none dark:bg-zinc-900"
      />
    );
  }

  function renderPage(cab: Cabinet, page: FlatPage, depth: number): React.ReactNode {
    const kids = sortedChildren(cab.pages, page.id);
    const isOpen = expanded.has(page.id);
    const isSelected = selectedId === page.id;
    const dropPosition = dropTarget?.kind === "page" && dropTarget.pageId === page.id ? dropTarget.position : null;
    const isDragging = draggingPageId === page.id;
    return (
      <div key={page.id}>
        <div
          draggable={rename?.id !== page.id}
          onDragStart={(event) => onPageDragStart(event, page.id)}
          onDragOver={(event) => onPageDragOver(event, cab.id, page.id)}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          className={cn(
            "group/row relative flex h-8 cursor-grab items-center gap-1 rounded-lg pr-1.5 text-sm transition active:cursor-grabbing",
            isSelected ? "bg-[var(--accent)]/12 font-medium text-[var(--accent)]" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70",
            dropPosition === "inside" && "bg-[var(--accent)]/14 ring-1 ring-[var(--accent)]/40",
            isDragging && "opacity-45",
          )}
          style={{ paddingLeft: `${depth * 14 + 4}px` }}
        >
          {dropPosition === "before" && <span className="pointer-events-none absolute left-2 right-2 top-0 h-0.5 rounded-full bg-[var(--accent)]" />}
          {dropPosition === "after" && <span className="pointer-events-none absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--accent)]" />}
          <button
            type="button"
            onClick={() => (kids.length ? toggle(page.id) : select(page.id))}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            {kids.length ? (isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
          </button>
          <span className="shrink-0 text-base leading-none">{page.icon}</span>
          {rename?.id === page.id ? (
            <RenameInput initial={page.title} />
          ) : (
            <button
              type="button"
              onClick={() => select(page.id)}
              onDoubleClick={() => setRename({ id: page.id, kind: "page" })}
              className="flex-1 truncate py-1 text-left"
            >
              {page.title || "Untitled"}
            </button>
          )}
          <button type="button" title="Add sub-page" onClick={() => createPage(cab.id, page.id)} className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 group-hover/row:flex dark:hover:bg-zinc-700 dark:hover:text-zinc-200">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button type="button" title="Delete page" onClick={() => deletePage(cab.id, page.id)} className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-red-100 hover:text-red-600 group-hover/row:flex dark:hover:bg-red-950 dark:hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {isOpen && kids.map((kid) => renderPage(cab, kid, depth + 1))}
      </div>
    );
  }

  function renderCabinet(cab: Cabinet): React.ReactNode {
    const roots = sortedChildren(cab.pages, null);
    const isOpen = expanded.has(cab.id);
    const color = COLORS[cab.color] ?? COLORS.blue;
    const cabinetDropActive = dropTarget?.kind === "cabinet" && dropTarget.cabinetId === cab.id;
    return (
      <div key={cab.id} className="mb-1">
        <div
          onDragOver={(event) => onCabinetDragOver(event, cab.id)}
          onDrop={onDrop}
          className={cn(
            "group/cab relative flex h-9 items-center gap-1.5 rounded-lg px-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/70",
            cabinetDropActive && "bg-[var(--accent)]/12 ring-1 ring-[var(--accent)]/40",
          )}
        >
          <button type="button" onClick={() => toggle(cab.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button type="button" onClick={() => setIconFor(iconFor === cab.id ? null : cab.id)} className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm", color.chip)} title="Change icon">
              {cab.icon}
            </button>
            {iconFor === cab.id && <EmojiPicker onPick={(emoji) => patchCabinet(cab.id, { icon: emoji })} onClose={() => setIconFor(null)} />}
          </div>
          {rename?.id === cab.id ? (
            <RenameInput initial={cab.name} />
          ) : (
            <button type="button" onClick={() => toggle(cab.id)} onDoubleClick={() => setRename({ id: cab.id, kind: "cabinet" })} className="flex-1 truncate py-1 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {cab.name}
            </button>
          )}
          <button type="button" title="New page" onClick={() => createPage(cab.id)} className="hidden h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 group-hover/cab:flex dark:hover:bg-zinc-700 dark:hover:text-zinc-200">
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" title="Cabinet options" onClick={() => setMenuFor(menuFor === cab.id ? null : cab.id)} className={cn("h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200", menuFor === cab.id ? "flex" : "hidden group-hover/cab:flex")}>
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuFor === cab.id && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuFor(null)} />
              <div className="absolute right-1 top-9 z-40 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Color</p>
                <div className="flex flex-wrap gap-1.5 px-1 pb-2">
                  {COLOR_KEYS.map((key) => (
                    <button key={key} type="button" onClick={() => { patchCabinet(cab.id, { color: key }); }} className={cn("h-5 w-5 rounded-full ring-offset-1 transition", COLORS[key].dot, cab.color === key && "ring-2 ring-zinc-400 dark:ring-zinc-500")} title={key} />
                  ))}
                </div>
                <button type="button" onClick={() => { setMenuFor(null); setRename({ id: cab.id, kind: "cabinet" }); renameValue.current = cab.name; }} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <MoreHorizontal className="h-4 w-4 text-zinc-400" /> Rename
                </button>
                <button type="button" onClick={() => deleteCabinet(cab.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50">
                  <Trash2 className="h-4 w-4" /> Delete cabinet
                </button>
              </div>
            </>
          )}
        </div>
        {isOpen && (
          <div className="mt-0.5">
            {roots.length ? roots.map((p) => renderPage(cab, p, 1)) : (
              <button type="button" onClick={() => createPage(cab.id)} className="ml-6 flex items-center gap-1.5 py-1 text-xs text-zinc-400 hover:text-[var(--accent)]">
                <Plus className="h-3.5 w-3.5" /> Add a page
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10.5rem)] min-h-[560px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* ── Filing-cabinet sidebar ── */}
      <aside className={cn("flex w-72 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/40", treeOpen ? "flex" : "hidden lg:flex")}>
        <div className="flex items-center gap-2 px-3 pt-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pages…" className="h-8 w-full rounded-lg border border-zinc-200 bg-white pl-8 pr-7 text-sm outline-none focus:border-[var(--accent)] dark:border-zinc-700 dark:bg-zinc-900" />
            {query && <button type="button" onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <button type="button" onClick={() => setTreeOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 lg:hidden"><PanelLeftClose className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="space-y-1.5 px-1 py-1">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />)}</div>
          ) : searchResults ? (
            searchResults.length ? searchResults.map(({ cabinet, page }) => (
              <button key={page.id} type="button" onClick={() => select(page.id)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800", selectedId === page.id && "bg-[var(--accent)]/12 text-[var(--accent)]")}>
                <span className="text-base leading-none">{page.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{page.title || "Untitled"}</span>
                  <span className="block truncate text-xs text-zinc-400">{cabinet.icon} {cabinet.name}</span>
                </span>
              </button>
            )) : <p className="px-2 py-6 text-center text-sm text-zinc-400">No pages match “{query}”.</p>
          ) : cabinets.length ? (
            cabinets.map(renderCabinet)
          ) : (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]"><FolderPlus className="h-5 w-5" /></div>
              <p className="text-sm font-medium">No cabinets yet</p>
              <p className="mt-1 text-xs text-zinc-400">Create a filing cabinet to start organizing your notes into pages.</p>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <button type="button" onClick={createCabinet} disabled={busy} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} New filing cabinet
          </button>
        </div>
      </aside>

      {/* ── Editor pane ── */}
      <section className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        {!treeOpen && (
          <button type="button" onClick={() => setTreeOpen(true)} className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 lg:hidden"><PanelLeftOpen className="h-4 w-4" /></button>
        )}
        {selectedId ? (
          <NoteEditor pageId={selectedId} user={user} onMeta={onEditorMeta} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]"><FolderPlus className="h-6 w-6" /></div>
            <h3 className="text-lg font-semibold">Your notes, beautifully organized</h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {cabinets.length ? "Pick a page from the sidebar, or add a new one." : "Create your first filing cabinet, then fill it with pages."}
            </p>
            <button type="button" onClick={createCabinet} disabled={busy} className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90 disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} New filing cabinet
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
