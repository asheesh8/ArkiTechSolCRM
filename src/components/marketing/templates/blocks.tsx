import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { FaqItem } from "@/components/marketing/faq/faq-item";
import { OwnerTodo } from "@/components/marketing/site/owner-todo";
import type { Block, Link as PageLink, Section } from "@/lib/content/types";
import type { Faq } from "@/lib/marketing/faq";
import { PEOPLE } from "@/lib/marketing/site";
import { liveLinks } from "@/lib/content/registry";

/**
 * The pieces every content template is built from. All of it renders on the
 * server, so the words are in the HTML before any script runs.
 */

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Renders [label](href) inside paragraph text as links; everything else is plain text. */
export function Rich({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(
      href.startsWith("/") ? (
        <Link key={m.index} href={href} className="text-link text-[var(--fg)]">
          {label}
        </Link>
      ) : (
        <a key={m.index} href={href} className="text-link text-[var(--fg)]" rel="noopener" target="_blank">
          {label}
        </a>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Plain text of a Rich string, for schema and word counts. */
export const plainText = (text: string) => text.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");

export function QuickAnswer({ text }: { text: string }) {
  return (
    <aside aria-label="Quick answer" className="border-l-2 border-[var(--lamp)] bg-[var(--bg-2)] px-6 py-5 sm:px-8 sm:py-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent-text)]">Quick answer</p>
      <p className="mt-3 text-[1.08rem] leading-relaxed text-[var(--fg)]">
        <Rich text={text} />
      </p>
    </aside>
  );
}

/** "By Ashish Subedi · Last updated ..." with the published date alongside. */
export function Byline({ published, updated }: { published: string; updated: string }) {
  const author = PEOPLE[0];
  return (
    <p className="text-sm text-[var(--dim)]">
      By{" "}
      <Link href="/about" className="text-link text-[var(--fg-2)]">
        {author.name}
      </Link>
      , {author.jobTitle} · Last updated <time dateTime={updated}>{longDate(updated)}</time>
      {published !== updated ? (
        <>
          {" "}
          · Published <time dateTime={published}>{longDate(published)}</time>
        </>
      ) : null}
    </p>
  );
}

function BlockView({ block }: { block: Block }) {
  if ("p" in block) {
    return (
      <p>
        <Rich text={block.p} />
      </p>
    );
  }
  if ("list" in block) {
    return (
      <ul className="grid gap-2 pl-5 [list-style:disc]">
        {block.list.map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
    );
  }
  if ("table" in block) {
    return (
      <div className="-mx-[var(--page-pad)] overflow-x-auto px-[var(--page-pad)] sm:mx-0 sm:px-0">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[0.95rem]">
          {block.table.caption ? <caption className="mb-3 text-left text-sm text-[var(--dim)]">{block.table.caption}</caption> : null}
          <thead>
            <tr>
              {block.table.head.map((h) => (
                <th key={h} scope="col" className="border-b border-[var(--rule-strong)] py-3 pr-4 font-medium text-[var(--fg)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="border-b border-[var(--rule)] py-3 pr-4 align-top font-medium text-[var(--fg)]">
                      <Rich text={cell} />
                    </th>
                  ) : (
                    <td key={i} className="border-b border-[var(--rule)] py-3 pr-4 align-top">
                      <Rich text={cell} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if ("sources" in block) {
    return (
      <div>
        <p className="text-sm font-medium text-[var(--fg)]">Sources</p>
        <ul className="mt-2 grid gap-1.5 text-sm">
          {block.sources.map((s) => (
            <li key={s.href}>
              <a href={s.href} className="text-link text-[var(--fg-2)]" rel="noopener" target="_blank">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <OwnerTodo>{block.todo}</OwnerTodo>;
}

/** Question H2s with their answers. */
export function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="grid gap-14">
      {sections.map((s) => (
        <section key={s.h2}>
          <h2 className="ak-display h-md">{s.h2}</h2>
          <div className="mt-5 grid gap-4 text-[1.04rem] leading-relaxed text-[var(--fg-2)]">
            {s.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** An FAQ list whose items match the page's FAQPage schema word for word. */
export function FaqBlock({ items, title = "Frequently asked questions" }: { items: Faq[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="ak-display h-md">{title}</h2>
      <div className="mt-4 border-t border-[var(--rule)]">
        {items.map((item) => (
          <FaqItem key={item.q} question={item.q}>
            <p>{item.a}</p>
            {item.link ? (
              <Link href={item.link.href} className="ak-arrow-link mt-4">
                {item.link.label} <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            {item.todo ? <OwnerTodo>{item.todo}</OwnerTodo> : null}
          </FaqItem>
        ))}
      </div>
    </section>
  );
}

/** Descriptive links to the pages this one leads to. */
export function Related({ links: all, title = "Related" }: { links: PageLink[]; title?: string }) {
  const links = liveLinks(all);
  if (!links.length) return null;
  return (
    <nav aria-label={title} className="border-t border-[var(--rule)] pt-8">
      <p className="text-sm text-[var(--dim)]">{title}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex items-center justify-between gap-4 border border-[var(--rule)] px-5 py-4 transition-colors hover:border-[var(--rule-strong)]"
            >
              <span className="text-[var(--fg)]">{l.label}</span>
              <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-[var(--dim)] group-hover:text-[var(--fg)]" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The draft notice on noindex outlines, so a visitor who lands there isn't confused. */
export function DraftNotice() {
  return (
    <p className="border border-[var(--rule)] px-5 py-4 text-sm text-[var(--dim)]">
      This page is still being written. The outline below shows what it will cover.
    </p>
  );
}
