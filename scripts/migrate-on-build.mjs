/**
 * Apply pending Prisma migrations as part of the production build.
 *
 * Without this, migrations were only ever applied by hand. A schema change
 * could ship, deploy green, and then 500 the first time anything touched the
 * new table — which is exactly how the pricing editor broke: the table landed
 * in 20260822040000_add_pricing_plans and nothing ever created it.
 *
 * Skips rather than fails when DATABASE_URL is absent, so lint and preview
 * builds that never talk to a database still work. The skip is logged loudly,
 * because a silent skip here is the same bug over again.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

if (!process.env.DATABASE_URL) {
  console.log("[migrate] DATABASE_URL is not set at build time — skipping migrations.");
  console.log("[migrate] If this is the production build, migrations are NOT being applied.");
  process.exit(0);
}

// Resolve the binary rather than trusting PATH: whether node_modules/.bin is
// exported depends on which package manager invoked the build, and a
// "command not found" here would otherwise read as a migration failure.
const binary = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);
const usingLocal = existsSync(binary);

console.log(`[migrate] Applying pending migrations (${usingLocal ? "local prisma" : "prisma from PATH"})…`);
const result = spawnSync(usingLocal ? binary : "prisma", ["migrate", "deploy"], {
  stdio: "inherit",
  shell: !usingLocal,
});

if (result.status !== 0) {
  console.error("[migrate] Migration failed — stopping the build rather than shipping against a stale schema.");
  process.exit(result.status ?? 1);
}
console.log("[migrate] Schema is up to date.");
