import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { subscribeToNotePage, type NotePageEvent } from "@/lib/notes-realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SNAPSHOT_FALLBACK_MS = 500;
const HEARTBEAT_MS = 15_000;

const PAGE_SELECT = {
  title: true,
  icon: true,
  content: true,
  updatedAt: true,
} as const;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await prisma.notePage.findUnique({ where: { id }, select: { id: true } });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  let seenVersion = req.nextUrl.searchParams.get("version") ?? "";

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          close();
        }
      };

      const sendSnapshot = async () => {
        try {
          const latest = await prisma.notePage.findUnique({ where: { id }, select: PAGE_SELECT });
          if (!latest) {
            send("deleted", { pageId: id });
            close();
            return;
          }

          const updatedAt = latest.updatedAt.toISOString();
          if (updatedAt === seenVersion) return;
          seenVersion = updatedAt;
          send("page", {
            actorId: null,
            page: { title: latest.title, icon: latest.icon, content: latest.content, updatedAt },
          } satisfies NotePageEvent);
        } catch {
          send("error", { message: "Unable to read latest page" });
        }
      };

      const unsubscribe = subscribeToNotePage(id, (event) => {
        seenVersion = event.page.updatedAt;
        send("page", event);
      });

      const fallback = setInterval(() => { void sendSnapshot(); }, SNAPSHOT_FALLBACK_MS);
      const heartbeat = setInterval(() => send("ping", { now: Date.now() }), HEARTBEAT_MS);

      const close = () => {
        if (closed) return;
        closed = true;
        unsubscribe();
        clearInterval(fallback);
        clearInterval(heartbeat);
        req.signal.removeEventListener("abort", close);
        try { controller.close(); } catch {}
      };

      cleanup = close;
      req.signal.addEventListener("abort", close);
      send("ready", { ok: true });
      void sendSnapshot();
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
