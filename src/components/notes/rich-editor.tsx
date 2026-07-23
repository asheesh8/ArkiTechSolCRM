"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold, Code, Heading1, Heading2, Heading3, Italic, Link2, List, ListChecks,
  ListOrdered, Minus, Pilcrow, Quote, Strikethrough, Underline, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SlashItem = { key: string; label: string; hint: string; icon: LucideIcon };
type ToolItem = { key: string; label: string; icon: LucideIcon };

const TODO_HTML = '<ul class="todo-list"><li data-checked="false"><br></li></ul>';
const SLASH_ITEMS: SlashItem[] = [
  { key: "text", label: "Text", hint: "Plain paragraph", icon: Pilcrow },
  { key: "h1", label: "Heading 1", hint: "Big section title", icon: Heading1 },
  { key: "h2", label: "Heading 2", hint: "Medium heading", icon: Heading2 },
  { key: "h3", label: "Heading 3", hint: "Small heading", icon: Heading3 },
  { key: "todo", label: "To-do list", hint: "Track tasks with checkboxes", icon: ListChecks },
  { key: "bullet", label: "Bulleted list", hint: "Simple bullet list", icon: List },
  { key: "number", label: "Numbered list", hint: "Ordered list", icon: ListOrdered },
  { key: "quote", label: "Quote", hint: "Capture a callout", icon: Quote },
  { key: "code", label: "Code", hint: "Monospaced block", icon: Code },
  { key: "divider", label: "Divider", hint: "Visual separator", icon: Minus },
];

const TOOLS: Array<ToolItem | "sep"> = [
  { key: "h1", label: "Heading 1", icon: Heading1 },
  { key: "h2", label: "Heading 2", icon: Heading2 },
  { key: "h3", label: "Heading 3", icon: Heading3 },
  "sep",
  { key: "bold", label: "Bold", icon: Bold },
  { key: "italic", label: "Italic", icon: Italic },
  { key: "underline", label: "Underline", icon: Underline },
  { key: "strike", label: "Strikethrough", icon: Strikethrough },
  "sep",
  { key: "bullet", label: "Bulleted list", icon: List },
  { key: "number", label: "Numbered list", icon: ListOrdered },
  { key: "todo", label: "To-do list", icon: ListChecks },
  "sep",
  { key: "quote", label: "Quote", icon: Quote },
  { key: "code", label: "Code block", icon: Code },
  { key: "divider", label: "Divider", icon: Minus },
  { key: "link", label: "Link", icon: Link2 },
];

export function RichEditor({ initialHTML, onChange, onFocusChange }: { initialHTML: string; onChange: (html: string) => void; onFocusChange?: (focused: boolean) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const slashAnchor = useRef<{ node: Node; offset: number } | null>(null);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [activeIdx, setActiveIdx] = useState(0);

  const refreshEmpty = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const empty = !el.textContent?.trim() && !el.querySelector("img, hr, li");
    el.dataset.empty = empty ? "true" : "false";
  }, []);

  // Seed the editable surface once; React never re-renders this DOM afterward.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHTML || "";
      refreshEmpty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const focusEditor = () => editorRef.current?.focus();

  const exec = useCallback((cmd: string, value?: string) => {
    focusEditor();
    document.execCommand(cmd, false, value);
    refreshEmpty();
    emit();
  }, [emit, refreshEmpty]);

  const format = useCallback((tag: string) => exec("formatBlock", tag), [exec]);

  const insertTodo = useCallback(() => {
    focusEditor();
    document.execCommand("insertHTML", false, TODO_HTML);
    refreshEmpty();
    emit();
  }, [emit, refreshEmpty]);

  const insertLink = useCallback(() => {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url.trim());
  }, [exec]);

  const filtered = slashQuery
    ? SLASH_ITEMS.filter((i) => i.label.toLowerCase().includes(slashQuery.toLowerCase()))
    : SLASH_ITEMS;

  const closeSlash = useCallback(() => {
    setSlashOpen(false);
    setSlashQuery("");
    slashAnchor.current = null;
  }, []);

  const positionSlash = useCallback(() => {
    const sel = window.getSelection();
    const wrap = wrapRef.current;
    if (!sel || sel.rangeCount === 0 || !wrap) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    setSlashPos({ top: rect.bottom - wrapRect.top + 6, left: rect.left - wrapRect.left });
  }, []);

  // Detect "/" typing and keep the query in sync with what follows it.
  const syncSlash = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) { closeSlash(); return; }
    const node = sel.focusNode;
    const offset = sel.focusOffset;
    if (!node || node.nodeType !== Node.TEXT_NODE) { if (slashOpen) closeSlash(); return; }
    const text = node.textContent ?? "";

    if (!slashOpen) {
      const before = text.slice(0, offset);
      const slashIdx = before.lastIndexOf("/");
      const startsBlock = slashIdx === 0 || /\s/.test(before[slashIdx - 1] ?? " ");
      if (slashIdx !== -1 && startsBlock && !/\s/.test(before.slice(slashIdx + 1))) {
        slashAnchor.current = { node, offset: slashIdx };
        setSlashQuery(before.slice(slashIdx + 1));
        setActiveIdx(0);
        setSlashOpen(true);
        positionSlash();
      }
      return;
    }

    const anchor = slashAnchor.current;
    if (!anchor || anchor.node !== node || offset <= anchor.offset) { closeSlash(); return; }
    const q = text.slice(anchor.offset + 1, offset);
    if (/\s/.test(q)) { closeSlash(); return; }
    setSlashQuery(q);
    setActiveIdx(0);
    positionSlash();
  }, [slashOpen, closeSlash, positionSlash]);

  const runCommand = useCallback((key: string) => {
    if (key === "text") format("P");
    else if (key === "h1") format("H1");
    else if (key === "h2") format("H2");
    else if (key === "h3") format("H3");
    else if (key === "todo") insertTodo();
    else if (key === "bullet") exec("insertUnorderedList");
    else if (key === "number") exec("insertOrderedList");
    else if (key === "quote") format("BLOCKQUOTE");
    else if (key === "code") format("PRE");
    else if (key === "divider") exec("insertHorizontalRule");
    else if (key === "bold") exec("bold");
    else if (key === "italic") exec("italic");
    else if (key === "underline") exec("underline");
    else if (key === "strike") exec("strikeThrough");
    else if (key === "link") insertLink();
  }, [exec, format, insertLink, insertTodo]);

  const runSlashItem = useCallback((item: SlashItem) => {
    const anchor = slashAnchor.current;
    const sel = window.getSelection();
    if (anchor && sel && sel.rangeCount > 0) {
      // Wipe the "/query" text before applying the block format.
      const range = document.createRange();
      range.setStart(anchor.node, anchor.offset);
      range.setEnd(sel.focusNode as Node, sel.focusOffset);
      range.deleteContents();
      sel.removeAllRanges();
      const collapsed = document.createRange();
      collapsed.setStart(anchor.node, anchor.offset);
      collapsed.collapse(true);
      sel.addRange(collapsed);
    }
    closeSlash();
    runCommand(item.key);
  }, [closeSlash, runCommand]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (slashOpen && filtered.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % filtered.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); runSlashItem(filtered[activeIdx]); return; }
      if (e.key === "Escape") { e.preventDefault(); closeSlash(); return; }
    }
    // Tab to indent / outdent list items.
    if (e.key === "Tab") {
      e.preventDefault();
      exec(e.shiftKey ? "outdent" : "indent");
    }
  }, [slashOpen, filtered, activeIdx, runSlashItem, closeSlash, exec]);

  const onInput = useCallback(() => {
    refreshEmpty();
    emit();
    syncSlash();
  }, [refreshEmpty, emit, syncSlash]);

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  // Toggle a checklist item when its left-hand checkbox gutter is clicked.
  const onClick = useCallback((e: React.MouseEvent) => {
    const li = (e.target as HTMLElement).closest("li");
    if (li && li.parentElement?.classList.contains("todo-list")) {
      const rect = li.getBoundingClientRect();
      if (e.clientX - rect.left <= 26) {
        li.setAttribute("data-checked", li.getAttribute("data-checked") === "true" ? "false" : "true");
        emit();
        e.preventDefault();
      }
    }
  }, [emit]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="sticky top-0 z-10 -mx-1 mb-3 flex flex-wrap items-center gap-0.5 rounded-xl border border-zinc-200 bg-white/90 px-1.5 py-1 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        {TOOLS.map((t, i) =>
          t === "sep" ? (
            <span key={i} className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
          ) : (
            <button
              key={i}
              type="button"
              title={t.label}
              aria-label={t.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(t.key)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <t.icon className="h-4 w-4" />
            </button>
          ),
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder="Start writing, or press “/” for headings, lists, to-dos and more…"
        onInput={onInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onClick={onClick}
        onFocus={() => onFocusChange?.(true)}
        onBlur={() => { onFocusChange?.(false); setTimeout(() => setSlashOpen(false), 120); }}
        className="note-content min-h-[60vh] pb-24"
      />

      {slashOpen && filtered.length > 0 && (
        <div
          className="absolute z-40 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
          style={{ top: slashPos.top, left: slashPos.left }}
        >
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Blocks</p>
          {filtered.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => runSlashItem(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition",
                i === activeIdx ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block truncate text-xs text-zinc-400">{item.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
