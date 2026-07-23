export type NotePageSnapshot = {
  title: string;
  icon: string;
  content: string;
  updatedAt: string;
};

export type NotePageEvent = {
  actorId: string | null;
  page: NotePageSnapshot;
};

type Listener = (event: NotePageEvent) => void;

const globalForNotes = globalThis as unknown as {
  notePageListeners?: Map<string, Set<Listener>>;
};

function listeners() {
  if (!globalForNotes.notePageListeners) globalForNotes.notePageListeners = new Map();
  return globalForNotes.notePageListeners;
}

export function subscribeToNotePage(pageId: string, listener: Listener) {
  const map = listeners();
  const set = map.get(pageId) ?? new Set<Listener>();
  set.add(listener);
  map.set(pageId, set);

  return () => {
    set.delete(listener);
    if (set.size === 0) map.delete(pageId);
  };
}

export function publishNotePage(pageId: string, event: NotePageEvent) {
  const set = listeners().get(pageId);
  if (!set) return;
  for (const listener of set) listener(event);
}
