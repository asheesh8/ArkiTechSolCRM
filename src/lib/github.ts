/**
 * Creating a repo from an approved demo zip.
 *
 * Uses the Git Data API rather than the Contents API: Contents is one request
 * and one commit per file, which for a site of a few hundred files is both slow
 * and a wall of useless history. Blobs → tree → commit → ref puts the whole
 * build in as a single initial commit, which is what you would have got had the
 * developer pushed it themselves.
 *
 * Configuration is read from the environment and never stored in the database.
 * When it is missing the caller gets a clear "not configured" rather than a
 * cryptic 401 from GitHub.
 */

const API = "https://api.github.com";

export type GitHubConfig = { token: string; org: string };

export function githubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const org = process.env.GITHUB_ORG;
  if (!token || !org) return null;
  return { token, org };
}

async function gh(cfg: GitHubConfig, path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // Surface GitHub's own message — "name already exists on this account" is
    // the common one and is worth showing verbatim.
    let message = `GitHub responded ${res.status}`;
    try {
      const parsed = JSON.parse(detail);
      if (parsed?.message) message = parsed.message;
      if (Array.isArray(parsed?.errors) && parsed.errors[0]?.message) {
        message = `${message} — ${parsed.errors[0].message}`;
      }
    } catch {
      /* non-JSON body; the status alone will have to do */
    }
    throw new Error(message);
  }
  return res.json();
}

/** A repo name GitHub will accept, derived from the demo title. */
export function repoNameFrom(title: string, businessType: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base ? `demo-${base}` : `demo-${businessType}-${Date.now()}`;
}

export type RepoFile = { path: string; content: Uint8Array };

/**
 * Create a private repo under the configured org and commit `files` to it.
 * Returns the repo's html_url.
 */
export async function createRepoWithFiles(
  cfg: GitHubConfig,
  name: string,
  description: string,
  files: RepoFile[],
): Promise<{ htmlUrl: string; fullName: string }> {
  const repo = await gh(cfg, `/orgs/${cfg.org}/repos`, {
    method: "POST",
    body: JSON.stringify({ name, description, private: true, auto_init: false }),
  });
  const fullName: string = repo.full_name;

  // Blobs first. base64 so binary assets survive the trip intact.
  const blobs: { path: string; sha: string }[] = [];
  for (const file of files) {
    const blob = await gh(cfg, `/repos/${fullName}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({
        content: Buffer.from(file.content).toString("base64"),
        encoding: "base64",
      }),
    });
    blobs.push({ path: file.path, sha: blob.sha });
  }

  const tree = await gh(cfg, `/repos/${fullName}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      tree: blobs.map((b) => ({ path: b.path, mode: "100644", type: "blob", sha: b.sha })),
    }),
  });

  const commit = await gh(cfg, `/repos/${fullName}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message: "Initial commit from approved demo build", tree: tree.sha }),
  });

  // auto_init was false, so there is no branch yet — create it rather than
  // update it. This is why the repo is made empty above.
  await gh(cfg, `/repos/${fullName}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: "refs/heads/main", sha: commit.sha }),
  });

  return { htmlUrl: repo.html_url, fullName };
}
