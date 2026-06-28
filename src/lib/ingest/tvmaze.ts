import { resolvePlatformSlugFromName } from "./platform-map";
import type { IngestRelease, IngestSeries } from "./upsert";

type TvmazeShow = {
  id: number;
  name: string;
  summary: string | null;
  image: { medium?: string; original?: string } | null;
  network: { name: string } | null;
  webChannel: { name: string } | null;
};

type TvmazeEpisode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string;
  summary: string | null;
  show?: TvmazeShow;
  _embedded?: { show: TvmazeShow };
};

function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > 0 ? text : null;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchSchedule(url: string): Promise<TvmazeEpisode[]> {
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  TVMaze request failed (${res.status}): ${url}`);
    return [];
  }
  return res.json();
}

export type TvmazeIngestResult = {
  series: IngestSeries[];
  releases: IngestRelease[];
  skipped: number;
};

/**
 * Fetches TV schedules (broadcast + streaming) for the given GB dates and
 * maps them to series/release rows. Episodes whose network/web channel
 * doesn't map to a known platform are skipped.
 */
export async function fetchTvmazeReleases(
  dates: string[],
  platformIdBySlug: Map<string, string>
): Promise<TvmazeIngestResult> {
  const seriesById = new Map<number, IngestSeries>();
  const releases: IngestRelease[] = [];
  let skipped = 0;

  for (const date of dates) {
    const [broadcast, web] = await Promise.all([
      fetchSchedule(`https://api.tvmaze.com/schedule?country=GB&date=${date}`),
      fetchSchedule(`https://api.tvmaze.com/schedule/web?date=${date}`),
    ]);

    for (const episode of [...broadcast, ...web]) {
      const show = episode.show ?? episode._embedded?.show;
      if (!show || episode.number == null) continue;

      const networkName = show.network?.name ?? show.webChannel?.name;
      const slug = resolvePlatformSlugFromName(networkName);
      if (!slug) {
        skipped++;
        continue;
      }
      const platformId = platformIdBySlug.get(slug);
      if (!platformId) {
        skipped++;
        continue;
      }

      const seriesId = `tvmaze-${show.id}`;
      if (!seriesById.has(show.id)) {
        seriesById.set(show.id, {
          id: seriesId,
          title: show.name,
          slug: `${slugify(show.name)}-${show.id}`,
          description: stripHtml(show.summary),
          artwork: show.image?.original ?? show.image?.medium ?? null,
          platformId,
          status: "active",
          tvmazeId: show.id,
        });
      }

      releases.push({
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
  }

  return { series: Array.from(seriesById.values()), releases, skipped };
}
