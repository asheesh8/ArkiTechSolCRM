/**
 * Creating a Vercel project from a shipped demo repo and kicking off a deploy.
 *
 * Deploys from the GitHub repo rather than by uploading files a second time:
 * the repo is already the source of truth by this point, and linking it means
 * every later push redeploys without going back through the CRM.
 *
 * Like the GitHub side, configuration comes from the environment. A missing
 * token is reported as "not configured" so the owner is told to set it rather
 * than being shown a bare 403.
 */

const API = "https://api.vercel.com";

export type VercelConfig = { token: string; teamId?: string };

export function vercelConfig(): VercelConfig | null {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return null;
  return { token, teamId: process.env.VERCEL_TEAM_ID || undefined };
}

async function vc(cfg: VercelConfig, path: string, init: RequestInit = {}) {
  const url = new URL(`${API}${path}`);
  if (cfg.teamId) url.searchParams.set("teamId", cfg.teamId);

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let message = `Vercel responded ${res.status}`;
    try {
      const parsed = JSON.parse(detail);
      if (parsed?.error?.message) message = parsed.error.message;
    } catch {
      /* non-JSON body */
    }
    throw new Error(message);
  }
  return res.json();
}

/**
 * Create a project linked to `owner/repo` and trigger the first deploy.
 * Returns the URL the demo will be reachable at.
 */
export async function createProjectAndDeploy(
  cfg: VercelConfig,
  name: string,
  repoFullName: string,
): Promise<{ projectUrl: string; deployUrl: string }> {
  const project = await vc(cfg, "/v10/projects", {
    method: "POST",
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: { type: "github", repo: repoFullName },
    }),
  });

  const deployment = await vc(cfg, "/v13/deployments", {
    method: "POST",
    body: JSON.stringify({
      name,
      project: project.id,
      target: "production",
      gitSource: { type: "github", repoId: project.link?.repoId, ref: "main" },
    }),
  });

  return {
    projectUrl: `https://vercel.com/${cfg.teamId ?? "dashboard"}/${name}`,
    // Vercel returns the host without a scheme.
    deployUrl: deployment.url ? `https://${deployment.url}` : `https://${name}.vercel.app`,
  };
}
