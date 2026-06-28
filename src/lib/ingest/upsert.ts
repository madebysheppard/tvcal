import { randomUUID } from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";

export type IngestSeries = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  artwork?: string | null;
  platformId: string;
  status?: "active" | "ended";
  tmdbId?: number | null;
  tvmazeId?: number | null;
};

export type IngestRelease = {
  title: string;
  seriesId: string | null;
  platformId: string;
  releaseDate: string;
  releaseType: "movie" | "season" | "episode" | "documentary" | "sport";
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
  synopsis?: string | null;
  artworkUrl?: string | null;
  sourceId: string;
  sourceType: string;
};

export async function upsertSeries(row: IngestSeries) {
  await db
    .insert(schema.series)
    .values({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description ?? null,
      artwork: row.artwork ?? null,
      platformId: row.platformId,
      status: row.status ?? "active",
      tmdbId: row.tmdbId ?? null,
      tvmazeId: row.tvmazeId ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.series.id,
      set: {
        title: row.title,
        description: row.description ?? null,
        artwork: row.artwork ?? null,
        updatedAt: new Date(),
      },
    });
}

/**
 * Inserts a release, or merges it into an existing row when another source
 * has already ingested the same series/platform/season/episode combination
 * (cross-source dedup), or updates the existing row for the same
 * (sourceId, sourceType) when re-running ingestion.
 */
export async function upsertRelease(row: IngestRelease): Promise<void> {
  if (row.seriesId && row.seasonNumber != null && row.episodeNumber != null) {
    const existing = await db
      .select({
        id: schema.releases.id,
        synopsis: schema.releases.synopsis,
        artworkUrl: schema.releases.artworkUrl,
        episodeTitle: schema.releases.episodeTitle,
      })
      .from(schema.releases)
      .where(
        and(
          eq(schema.releases.seriesId, row.seriesId),
          eq(schema.releases.platformId, row.platformId),
          eq(schema.releases.seasonNumber, row.seasonNumber),
          eq(schema.releases.episodeNumber, row.episodeNumber),
          ne(schema.releases.sourceId, row.sourceId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const current = existing[0];
      await db
        .update(schema.releases)
        .set({
          title: row.title,
          releaseDate: row.releaseDate,
          synopsis: current.synopsis ?? row.synopsis ?? null,
          artworkUrl: current.artworkUrl ?? row.artworkUrl ?? null,
          episodeTitle: current.episodeTitle ?? row.episodeTitle ?? null,
          updatedAt: new Date(),
        })
        .where(eq(schema.releases.id, current.id));
      return;
    }
  }

  await db
    .insert(schema.releases)
    .values({
      id: randomUUID(),
      title: row.title,
      seriesId: row.seriesId,
      platformId: row.platformId,
      releaseDate: row.releaseDate,
      releaseType: row.releaseType,
      seasonNumber: row.seasonNumber ?? null,
      episodeNumber: row.episodeNumber ?? null,
      episodeTitle: row.episodeTitle ?? null,
      synopsis: row.synopsis ?? null,
      artworkUrl: row.artworkUrl ?? null,
      sourceId: row.sourceId,
      sourceType: row.sourceType,
    })
    .onConflictDoUpdate({
      target: [schema.releases.sourceId, schema.releases.sourceType],
      set: {
        title: row.title,
        releaseDate: row.releaseDate,
        synopsis: row.synopsis ?? null,
        artworkUrl: row.artworkUrl ?? null,
        episodeTitle: row.episodeTitle ?? null,
        updatedAt: new Date(),
      },
    });
}
