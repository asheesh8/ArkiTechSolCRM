/** Legal documents: one readable column on paper, under the normal site nav. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="band pb-24 pt-[calc(var(--nav-h)+4rem)]">
      <div className="shell max-w-[52rem]">{children}</div>
    </div>
  );
}
