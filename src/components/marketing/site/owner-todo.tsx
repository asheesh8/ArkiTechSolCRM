/**
 * A note for the owner where a real fact is still missing. It shows in
 * development so it can't be overlooked, and renders nothing in production,
 * so visitors never see it. Every one is listed in the SEO summary.
 */
export function OwnerTodo({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p className="my-4 border border-dashed border-[var(--lamp)] px-4 py-3 text-sm text-[var(--accent-text)]">
      TODO(owner): {children}
    </p>
  );
}
