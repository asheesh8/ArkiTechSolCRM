import { NextResponse } from "next/server";
import { unzipSync } from "fflate";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { getObject } from "@/lib/r2";
import { githubConfig, createRepoWithFiles, repoNameFrom, type RepoFile } from "@/lib/github";
import { vercelConfig, createProjectAndDeploy } from "@/lib/vercel";
import { serializeDemo, DEMO_STATUS_LABEL } from "@/lib/demos";
import { briefLabel } from "@/lib/demo-briefs";

const DEV_SELECT = { id: true, name: true, email: true } as const;

/**
 * Turn an approved demo into a repo and a live deploy.
 *
 * This is the step that used to be four manual actions: download, unzip, create
 * a repo, wire up Vercel. Doing it here means the owner's whole involvement is
 * reviewing the work and pressing one button, which is the only version of this
 * that survives more than a handful of demos a week.
 */

/**
 * Paths that must never reach a repo.
 *
 * node_modules is the big one — it is the difference between a 3MB commit and
 * an unusable one, and it is what a developer zipping a project folder will
 * include by default. .git is excluded too: the zip's history is the
 * developer's local history, and we are creating a fresh initial commit.
 */
const EXCLUDED = [
  /(^|\/)node_modules\//,
  /(^|\/)\.next\//,
  /(^|\/)\.git\//,
  /(^|\/)\.vercel\//,
  /(^|\/)\.DS_Store$/,
  /(^|\/)\.env(\.|$)/,
];

function shouldSkip(path: string) {
  return EXCLUDED.some((re) => re.test(path));
}

/**
 * Zips made from a folder usually nest everything under one directory. Strip it
 * so package.json lands at the repo root, where Vercel expects it.
 */
function stripCommonPrefix(paths: string[]): string {
  if (paths.length === 0) return "";
  const first = paths[0];
  const slash = first.indexOf("/");
  if (slash === -1) return "";
  const candidate = first.slice(0, slash + 1);
  return paths.every((p) => p.startsWith(candidate)) ? candidate : "";
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isOwner(user)) {
    return NextResponse.json({ error: "Only an owner can ship a demo build." }, { status: 403 });
  }

  const { id } = await params;
  const demo = await prisma.demoSubmission.findUnique({
    where: { id },
    include: { developer: { select: DEV_SELECT } },
  });
  if (!demo) return NextResponse.json({ error: "That demo build doesn't exist." }, { status: 404 });
  if (demo.status !== "APPROVED") {
    return NextResponse.json(
      { error: `Only an approved build can be shipped. This one is ${DEMO_STATUS_LABEL[demo.status] ?? demo.status}.` },
      { status: 409 },
    );
  }
  if (!demo.zipKey) {
    return NextResponse.json({ error: "That build has no codebase attached." }, { status: 400 });
  }

  const gh = githubConfig();
  if (!gh) {
    return NextResponse.json(
      { error: "GitHub isn't configured on the server. Set GITHUB_TOKEN and GITHUB_ORG, then try again." },
      { status: 503 },
    );
  }
  const vercel = vercelConfig();

  // --- open the zip -------------------------------------------------------
  let files: RepoFile[];
  let skipped = 0;
  try {
    const buffer = await getObject(demo.zipKey);
    const entries = unzipSync(new Uint8Array(buffer));
    const allPaths = Object.keys(entries).filter((p) => !p.endsWith("/"));
    const prefix = stripCommonPrefix(allPaths);

    files = [];
    for (const path of allPaths) {
      if (shouldSkip(path)) {
        skipped += 1;
        continue;
      }
      const repoPath = prefix && path.startsWith(prefix) ? path.slice(prefix.length) : path;
      if (!repoPath) continue;
      files.push({ path: repoPath, content: entries[path] });
    }
  } catch (err) {
    console.error("[demos] could not open zip", err);
    return NextResponse.json({ error: "That zip could not be opened." }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Every file in that zip was excluded. It probably contains only node_modules." },
      { status: 400 },
    );
  }

  // --- create the repo ----------------------------------------------------
  const name = repoNameFrom(demo.title, demo.businessType);
  let repo: { htmlUrl: string; fullName: string };
  try {
    repo = await createRepoWithFiles(
      gh,
      name,
      `${briefLabel(demo.businessType)} demo — built by ${demo.developer.name}`,
      files,
    );
  } catch (err) {
    console.error("[demos] repo creation failed", err);
    return NextResponse.json(
      { error: `Couldn't create the repo: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 502 },
    );
  }

  // --- deploy -------------------------------------------------------------
  // The repo exists by this point. If the deploy fails the ship is still
  // recorded, because losing track of a created repo is worse than a missing
  // deploy URL the owner can add by hand.
  let deployUrl: string | null = null;
  let deployWarning: string | null = null;
  if (!vercel) {
    deployWarning = "Repo created. Vercel isn't configured (set VERCEL_TOKEN), so deploy it yourself.";
  } else {
    try {
      const result = await createProjectAndDeploy(vercel, name, repo.fullName);
      deployUrl = result.deployUrl;
    } catch (err) {
      console.error("[demos] deploy failed", err);
      deployWarning = `Repo created, but the deploy failed: ${err instanceof Error ? err.message : "unknown error"}`;
    }
  }

  const updated = await prisma.demoSubmission.update({
    where: { id },
    data: { status: "SHIPPED", repoUrl: repo.htmlUrl, deployUrl, shippedAt: new Date() },
    include: { developer: { select: DEV_SELECT } },
  });

  return NextResponse.json({
    demo: serializeDemo(updated),
    committed: files.length,
    skipped,
    deployWarning,
  });
}
