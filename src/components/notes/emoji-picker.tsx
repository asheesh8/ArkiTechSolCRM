"use client";

import { useEffect, useRef } from "react";

const EMOJIS = [
  "📄", "📝", "📋", "📑", "🗒️", "📌", "📎", "🔖",
  "📁", "🗂️", "🗃️", "🗄️", "📦", "📚", "📓", "📔",
  "💡", "✅", "⭐", "🔥", "🎯", "🚀", "📈", "📊",
  "💰", "🧾", "🤝", "📞", "📣", "🛠️", "⚙️", "🧠",
  "🧩", "🏢", "🏗️", "🌐", "✉️", "🗓️", "⏰", "🔔",
  "❤️", "💬", "🔒", "🔑", "🎨", "🧪", "🍀", "🌟",
];

export function EmojiPicker({ onPick, onClose }: { onPick: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 mt-1 grid w-64 grid-cols-8 gap-0.5 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => { onPick(emoji); onClose(); }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-lg leading-none transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
