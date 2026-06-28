import { db } from "@/db";
import { releases, platforms, series } from "@/db/schema";
import { eq, and, gte, lte, inArray, ne } from "drizzle-orm";

export type ReleaseWithRelations = {
  id: string;
  title: string;
  releaseDate: string;
  releaseType: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  synopsis: string | null;
  artworkUrl: string | null;
  platform: { id: string; name: string; slug: string };
  series: { id: string; title: string; slug: string } | null;
};

function formatDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getReleasesForDate(
  date: string,
  platformIds?: string[]
): Promise<ReleaseWithRelations[]> {
  const rows = await db
    .select({
      id: releases.id,
      title: releases.title,
      releaseDate: releases.releaseDate,
      releaseType: releases.releaseType,
      seasonNumber: releases.seasonNumber,
      episodeNumber: releases.episodeNumber,
      episodeTitle: releases.episodeTitle,
      synopsis: releases.synopsis,
      artworkUrl: releases.artworkUrl,
      platformId: platforms.id,
      platformName: platforms.name,
      platformSlug: platforms.slug,
      seriesId: series.id,
      seriesTitle: series.title,
      seriesSlug: series.slug,
    })
    .from(releases)
    .innerJoin(platforms, eq(releases.platformId, platforms.id))
    .leftJoin(series, eq(releases.seriesId, series.id))
    .where(
      and(
        eq(releases.releaseDate, date),
        ne(releases.releaseType, "movie"),
        platformIds?.length
          ? inArray(releases.platformId, platformIds)
          : undefined
      )
    )
    .orderBy(platforms.name, releases.title);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    releaseDate: r.releaseDate,
    releaseType: r.releaseType,
    seasonNumber: r.seasonNumber,
    episodeNumber: r.episodeNumber,
    episodeTitle: r.episodeTitle,
    synopsis: r.synopsis,
    artworkUrl: r.artworkUrl,
    platform: { id: r.platformId, name: r.platformName, slug: r.platformSlug },
    series: r.seriesId
      ? { id: r.seriesId, title: r.seriesTitle!, slug: r.seriesSlug! }
      : null,
  }));
}

export async function getTodayReleases(platformIds?: string[]) {
  return getReleasesForDate(formatDate(0), platformIds);
}

export async function getReleasesForRange(
  startOffset: number,
  endOffset: number,
  platformIds?: string[]
): Promise<ReleaseWithRelations[]> {
  const start = formatDate(startOffset);
  const end = formatDate(endOffset);

  const rows = await db
    .select({
      id: releases.id,
      title: releases.title,
      releaseDate: releases.releaseDate,
      releaseType: releases.releaseType,
      seasonNumber: releases.seasonNumber,
      episodeNumber: releases.episodeNumber,
      episodeTitle: releases.episodeTitle,
      synopsis: releases.synopsis,
      artworkUrl: releases.artworkUrl,
      platformId: platforms.id,
      platformName: platforms.name,
      platformSlug: platforms.slug,
      seriesId: series.id,
      seriesTitle: series.title,
      seriesSlug: series.slug,
    })
    .from(releases)
    .innerJoin(platforms, eq(releases.platformId, platforms.id))
    .leftJoin(series, eq(releases.seriesId, series.id))
    .where(
      and(
        gte(releases.releaseDate, start),
        lte(releases.releaseDate, end),
        ne(releases.releaseType, "movie"),
        platformIds?.length
          ? inArray(releases.platformId, platformIds)
          : undefined
      )
    )
    .orderBy(releases.releaseDate, platforms.name, releases.title);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    releaseDate: r.releaseDate,
    releaseType: r.releaseType,
    seasonNumber: r.seasonNumber,
    episodeNumber: r.episodeNumber,
    episodeTitle: r.episodeTitle,
    synopsis: r.synopsis,
    artworkUrl: r.artworkUrl,
    platform: { id: r.platformId, name: r.platformName, slug: r.platformSlug },
    series: r.seriesId
      ? { id: r.seriesId, title: r.seriesTitle!, slug: r.seriesSlug! }
      : null,
  }));
}

export function groupByPlatform(
  rows: ReleaseWithRelations[]
): { platform: { id: string; name: string; slug: string }; releases: ReleaseWithRelations[] }[] {
  const map = new Map<string, { platform: { id: string; name: string; slug: string }; releases: ReleaseWithRelations[] }>();

  for (const r of rows) {
    if (!map.has(r.platform.id)) {
      map.set(r.platform.id, { platform: r.platform, releases: [] });
    }
    map.get(r.platform.id)!.releases.push(r);
  }

  return Array.from(map.values());
}

export function groupByDate(
  rows: ReleaseWithRelations[]
): { date: string; releases: ReleaseWithRelations[] }[] {
  const map = new Map<string, ReleaseWithRelations[]>();

  for (const r of rows) {
    if (!map.has(r.releaseDate)) {
      map.set(r.releaseDate, []);
    }
    map.get(r.releaseDate)!.push(r);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, releases]) => ({ date, releases }));
}

export async function getAllPlatforms() {
  return db.select().from(platforms).orderBy(platforms.name);
}
