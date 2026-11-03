/**
 * Which app a request belongs to, decided from the host name.
 *
 *   acme.portal.arkitech-sol.com   -> workspace "acme"
 *   admin.portal.arkitech-sol.com  -> the ArkiTech staff console
 *   portal.arkitech-sol.com        -> the root (sign in, create a workspace)
 *
 * Locally the root domain is "localhost:3000", so acme.localhost:3000 works
 * in Chrome, and ?ws=acme is a fallback for browsers that don't resolve
 * sub-localhost names. Custom domains map to a slug later via the
 * workspaces table; the shape of this function doesn't change.
 */
export type HostContext =
  | { kind: "root" }
  | { kind: "admin" }
  | { kind: "workspace"; slug: string };

export const ADMIN_SUBDOMAIN = "admin";
const RESERVED = new Set(["www", "app", "api", "portal", ADMIN_SUBDOMAIN]);

export function rootDomain() {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000").toLowerCase();
}

export function resolveHost(hostHeader: string | null, searchParams?: URLSearchParams): HostContext {
  const host = (hostHeader ?? "").toLowerCase();
  const root = rootDomain();
  const override = searchParams?.get("ws");

  if (host === root || host === `www.${root}`) {
    return override ? contextFor(override) : { kind: "root" };
  }
  if (host.endsWith(`.${root}`)) {
    const sub = host.slice(0, -(root.length + 1));
    if (!sub.includes(".")) return contextFor(sub);
  }
  // A Vercel preview URL or an unknown host behaves like the root.
  return override ? contextFor(override) : { kind: "root" };
}

function contextFor(sub: string): HostContext {
  if (sub === ADMIN_SUBDOMAIN) return { kind: "admin" };
  if (RESERVED.has(sub)) return { kind: "root" };
  return { kind: "workspace", slug: sub };
}

/** Absolute URL for a workspace, honouring the local fallback. */
export function workspaceUrl(slug: string, path = "/") {
  const root = rootDomain();
  const proto = root.startsWith("localhost") ? "http" : "https";
  return `${proto}://${slug}.${root}${path}`;
}

export function adminUrl(path = "/") {
  return workspaceUrl(ADMIN_SUBDOMAIN, path);
}

export function rootUrl(path = "/") {
  const root = rootDomain();
  const proto = root.startsWith("localhost") ? "http" : "https";
  return `${proto}://${root}${path}`;
}
