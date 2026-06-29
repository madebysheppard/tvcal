"use server";

import { revalidatePath } from "next/cache";
import { searchTvmazeShows, fetchTvmazeShow, fetchTvmazeShowEpisodes, type TvmazeSearchResult } from "@/lib/ingest/tvmaze-search";
import { resolveOrCreatePlatformId } from "@/lib/ingest/resolve-platform";
import { upsertSeries, upsertRelease } from "@/lib/ingest/upsert";
import { stripHtml, slugify, mapSeriesStatus } from "@/lib/ingest/tvmaze-shared";
import { addToWatchlist } from "@/lib/watchlist-actions";

export async function searchTvmazeShowsAction(query: string): Promise<TvmazeSearchResult[]> {
  return searchTvmazeShows(query);
}

/**
 * Adds a show found via TVMaze search to the watchlist, fetching its full
 * episode history (not just whatever the rolling 14-day schedule ingest
 * happens to cover) so "next episode" and "last aired episode" are accurate
 * even for shows that have already ended or air far in the future.
 */
export async function addShowFromTvmaze(tvmazeId: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const show = await fetchTvmazeShow(tvmazeId);
  if (!show) return { ok: false, error: "Couldn't fetch that show from TVMaze." };

  const platformId = await resolveOrCreatePlatformId(show.network?.name ?? show.webChannel?.name);
  const seriesId = `tvmaze-${show.id}`;

  await upsertSeries({
    id: seriesId,
    title: show.name,
    slug: `${slugify(show.name)}-${show.id}`,
    description: stripHtml(show.summary),
    artwork: show.image?.original ?? show.image?.medium ?? null,
    platformId,
    status: mapSeriesStatus(show.status),
    tvmazeId: show.id,
  });

  const episodes = await fetchTvmazeShowEpisodes(tvmazeId);
  for (const episode of episodes) {
    if (episode.number == null || !episode.airdate) continue;
    await upsertRelease({
      title: `${show.name} — S${episode.season}E${episode.number}: ${episode.name}`,
      seriesId,
      platformId,
      releaseDate: episode.airdate,
      releaseType: "episode",
      seasonNumber: episode.season,
      episodeNumber: episode.number,
      episodeTitle: episode.name,
      synopsis: stripHtml(episode.summary),
      artworkUrl: null,
      sourceId: `tvmaze-episode-${episode.id}`,
      sourceType: "tvmaze",
    });
  }

  await addToWatchlist(seriesId);
  revalidatePath("/");
  revalidatePath("/app");

  return { ok: true };
}
