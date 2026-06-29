import { db } from "@/db";
import { watchlist, series, releases, platforms } from "@/db/schema";
import { eq, inArray, and, gte, lt, asc, desc } from "drizzle-orm";

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getWatchedSeriesIds(): Promise<Set<string>> {
  const rows = await db.select({ seriesId: watchlist.seriesId }).from(watchlist);
  return new Set(rows.map((r) => r.seriesId));
}

type EpisodeRef = {
  releaseDate: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
};

export type WatchedShow = {
  series: { id: string; title: string; slug: string; artwork: string | null; status: "active" | "ended" };
  platform: { id: string; name: string; slug: string };
  nextEpisode: EpisodeRef | null;
  /** Most recently aired episode, used to show "last aired" when there's nothing upcoming. */
  lastEpisode: EpisodeRef | null;
};

export async function getWatchlistWithUpcoming(): Promise<WatchedShow[]> {
  const watched = await db
    .select({
      seriesId: series.id,
      seriesTitle: series.title,
      seriesSlug: series.slug,
      artwork: series.artwork,
      status: series.status,
      platformId: platforms.id,
      platformName: platforms.name,
      platformSlug: platforms.slug,
    })
    .from(watchlist)
    .innerJoin(series, eq(watchlist.seriesId, series.id))
    .innerJoin(platforms, eq(series.platformId, platforms.id))
    .orderBy(asc(watchlist.createdAt));

  if (watched.length === 0) return [];

  const seriesIds = watched.map((w) => w.seriesId);
  const todayStr = todayDateString();

  const [upcoming, past] = await Promise.all([
    db
      .select({
        seriesId: releases.seriesId,
        releaseDate: releases.releaseDate,
        seasonNumber: releases.seasonNumber,
        episodeNumber: releases.episodeNumber,
        episodeTitle: releases.episodeTitle,
      })
      .from(releases)
      .where(
        and(
          inArray(releases.seriesId, seriesIds),
          gte(releases.releaseDate, todayStr),
          eq(releases.releaseType, "episode")
        )
      )
      .orderBy(asc(releases.releaseDate), asc(releases.episodeNumber)),
    db
      .select({
        seriesId: releases.seriesId,
        releaseDate: releases.releaseDate,
        seasonNumber: releases.seasonNumber,
        episodeNumber: releases.episodeNumber,
        episodeTitle: releases.episodeTitle,
      })
      .from(releases)
      .where(
        and(
          inArray(releases.seriesId, seriesIds),
          lt(releases.releaseDate, todayStr),
          eq(releases.releaseType, "episode")
        )
      )
      .orderBy(desc(releases.releaseDate), desc(releases.episodeNumber)),
  ]);

  const nextByShow = new Map<string, EpisodeRef>();
  for (const r of upcoming) {
    if (r.seriesId && !nextByShow.has(r.seriesId)) nextByShow.set(r.seriesId, r);
  }

  const lastByShow = new Map<string, EpisodeRef>();
  for (const r of past) {
    if (r.seriesId && !lastByShow.has(r.seriesId)) lastByShow.set(r.seriesId, r);
  }

  return watched.map((w) => ({
    series: { id: w.seriesId, title: w.seriesTitle, slug: w.seriesSlug, artwork: w.artwork, status: w.status },
    platform: { id: w.platformId, name: w.platformName, slug: w.platformSlug },
    nextEpisode: nextByShow.get(w.seriesId) ?? null,
    lastEpisode: lastByShow.get(w.seriesId) ?? null,
  }));
}

export async function getAllSeriesForPicker() {
  return db
    .select({
      id: series.id,
      title: series.title,
      slug: series.slug,
      artwork: series.artwork,
      platformName: platforms.name,
    })
    .from(series)
    .innerJoin(platforms, eq(series.platformId, platforms.id))
    .orderBy(asc(series.title));
}
