import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveHost } from "@/lib/tenant/host";

/**
 * Runs before every page: refreshes the Supabase session cookie and routes
 * the request to the right app by host name.
 *
 *   workspace host  ->  /w/<slug>/...     (the client portal)
 *   admin host      ->  /admin/...        (the ArkiTech console)
 *   root host       ->  as is             (sign in, create workspace)
 *
 * The rewrite is internal; the address bar keeps the subdomain. Pages read
 * the slug from their route params, never from the host again.
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const ctx = resolveHost(request.headers.get("host"), url.searchParams);

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = url.pathname;
  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path.startsWith("/invite") ||
    path.startsWith("/api/public") ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/embed") ||
    path.startsWith("/_next") ||
    path.startsWith("/art") ||
    path.startsWith("/fonts") ||
    /\.(png|jpg|jpeg|svg|ico|webp|mp4|webm|txt|xml|json|js|css|woff2?)$/.test(path);

  if (!user && !isPublic) {
    const login = url.clone();
    login.pathname = "/login";
    login.searchParams.set("next", path + (url.search || ""));
    return NextResponse.redirect(login);
  }

  // Internal rewrite by tenant. Public and API paths are shared by every host.
  if (!isPublic && !path.startsWith("/api")) {
    if (ctx.kind === "workspace" && !path.startsWith("/w/")) {
      const target = url.clone();
      target.pathname = `/w/${ctx.slug}${path === "/" ? "" : path}`;
      target.searchParams.delete("ws");
      const rewritten = NextResponse.rewrite(target, { request });
      for (const c of response.cookies.getAll()) rewritten.cookies.set(c);
      rewritten.headers.set("x-workspace-slug", ctx.slug);
      return rewritten;
    }
    if (ctx.kind === "admin" && !path.startsWith("/admin")) {
      const target = url.clone();
      target.pathname = `/admin${path === "/" ? "" : path}`;
      const rewritten = NextResponse.rewrite(target, { request });
      for (const c of response.cookies.getAll()) rewritten.cookies.set(c);
      return rewritten;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
