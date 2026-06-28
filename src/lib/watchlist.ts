import { db } from "@/db";
import { watchlist, series, releases, platforms } from "@/db/schema";
import { eq, inArray, and, gte, asc } from "drizzle-orm";

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getWatchedSeriesIds(): Promise<Set<string>> {
  const rows = await db.select({ seriesId: watchlist.seriesId }).from(watchlist);
  return new Set(rows.map((r) => r.seriesId));
}

export type WatchedShow = {
  series: { id: string; title: string; slug: string; artwork: string | null };
  platform: { id: string; name: string; slug: string };
  nextEpisode: {
    releaseDate: string;
    seasonNumber: number | null;
    episodeNumber: number | null;
    episodeTitle: string | null;
  } | null;
};

export async function getWatchlistWithUpcoming(): Promise<WatchedShow[]> {
  const watched = await db
    .select({
      seriesId: series.id,
      seriesTitle: series.title,
      seriesSlug: series.slug,
      artwork: series.artwork,
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

  const upcoming = await db
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
    .orderBy(asc(releases.releaseDate), asc(releases.episodeNumber));

  const nextByShow = new Map<string, (typeof upcoming)[number]>();
  for (const r of upcoming) {
    if (r.seriesId && !nextByShow.has(r.seriesId)) nextByShow.set(r.seriesId, r);
  }

  return watched.map((w) => ({
    series: { id: w.seriesId, title: w.seriesTitle, slug: w.seriesSlug, artwork: w.artwork },
    platform: { id: w.platformId, name: w.platformName, slug: w.platformSlug },
    nextEpisode: nextByShow.get(w.seriesId) ?? null,
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
