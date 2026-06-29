import { db } from "@/db";
import { platforms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resolvePlatformSlugFromName } from "./platform-map";
import { slugify } from "./tvmaze-shared";

/**
 * Resolves a network/channel name to a platform id, preferring our curated
 * platform list (Netflix, Disney+, etc.) and falling back to creating a new
 * platform row on the fly for anything outside it. Used when a user
 * explicitly searches for and adds a specific show — unlike the rolling
 * schedule ingest, we don't want to silently skip it just because the show
 * airs somewhere outside our usual seven platforms.
 */
export async function resolveOrCreatePlatformId(networkName: string | null | undefined): Promise<string> {
  const name = networkName?.trim() || "Other";

  const knownSlug = resolvePlatformSlugFromName(name);
  if (knownSlug) {
    const existing = await db.select().from(platforms).where(eq(platforms.slug, knownSlug)).limit(1);
    if (existing.length > 0) return existing[0].id;
  }

  const slug = slugify(name) || "other";
  const existing = await db.select().from(platforms).where(eq(platforms.slug, slug)).limit(1);
  if (existing.length > 0) return existing[0].id;

  const [created] = await db
    .insert(platforms)
    .values({ id: slug, name, slug })
    .onConflictDoNothing()
    .returning();

  if (created) return created.id;

  // Lost a race with a concurrent insert — fetch what's there now.
  const [row] = await db.select().from(platforms).where(eq(platforms.slug, slug)).limit(1);
  return row.id;
}
