import { resolvePlatformSlugFromTmdbProvider } from "./platform-map";
import type { IngestRelease } from "./upsert";

const TMDB_BASE = "https://api.themoviedb.org/3";

type TmdbMovie = {
  id: number;
  title: string;
  overview: string | null;
  release_date: string;
  poster_path: string | null;
};

type TmdbDiscoverResponse = {
  results: TmdbMovie[];
  total_pages: number;
};

type TmdbWatchProvidersResponse = {
  results: Record<string, { flatrate?: { provider_id: number }[] }>;
};

async function tmdbGet<T>(path: string, apiKey: string, params: Record<string, string> = {}): Promise<T | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  TMDB request failed (${res.status}): ${path}`);
    return null;
  }
  return res.json();
}

export type TmdbIngestResult = {
  releases: IngestRelease[];
  skipped: number;
};

/**
 * Fetches movies releasing (theatrically/digitally) in GB within the given
 * date range, then resolves which of our tracked platforms each is
 * streaming on. Movies with no mapped streaming platform are skipped.
 */
export async function fetchTmdbReleases(
  startDate: string,
  endDate: string,
  apiKey: string,
  platformIdBySlug: Map<string, string>
): Promise<TmdbIngestResult> {
  const discover = await tmdbGet<TmdbDiscoverResponse>("/discover/movie", apiKey, {
    region: "GB",
    watch_region: "GB",
    "primary_release_date.gte": startDate,
    "primary_release_date.lte": endDate,
    sort_by: "primary_release_date.asc",
  });

  if (!discover?.results) {
    console.warn(`  TMDB discovery returned no results`);
    return { releases: [], skipped: 0 };
  }

  const releases: IngestRelease[] = [];
  let skipped = 0;

  // Fetch watch providers for all movies concurrently instead of sequentially (N+1)
  const providerResponses = await Promise.allSettled(
    discover.results.map((movie) =>
      tmdbGet<TmdbWatchProvidersResponse>(
        `/movie/${movie.id}/watch/providers`,
        apiKey
      )
    )
  );

  for (let i = 0; i < discover.results.length; i++) {
    const movie = discover.results[i];
    const providerResult = providerResponses[i];

    const providers =
      providerResult.status === "fulfilled" ? providerResult.value : null;
    const flatrate = providers?.results?.GB?.flatrate ?? [];

    const slugs = new Set(
      flatrate
        .map((p) => resolvePlatformSlugFromTmdbProvider(p.provider_id))
        .filter((slug): slug is string => slug !== null)
    );

    if (slugs.size === 0) {
      skipped++;
      continue;
    }

    for (const slug of slugs) {
      const platformId = platformIdBySlug.get(slug);
      if (!platformId) {
        skipped++;
        continue;
      }

      releases.push({
        title: movie.title,
        seriesId: null,
        platformId,
        releaseDate: movie.release_date,
        releaseType: "movie",
        synopsis: movie.overview,
        artworkUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        sourceId: `tmdb-movie-${movie.id}-${slug}`,
        sourceType: "tmdb",
      });
    }
  }

  return { releases, skipped };
}
