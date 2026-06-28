/**
 * Maps external network/provider identifiers (TVMaze network names, TMDB
 * watch-provider IDs) to our `platforms.slug` values from src/db/seed.ts.
 * Anything not listed here is unsupported and should be skipped by ingestion.
 */

// TVMaze `network.name` / `webChannel.name` -> platform slug (GB schedules)
export const TVMAZE_NETWORK_MAP: Record<string, string> = {
  Netflix: "netflix",
  "Disney+": "disney-plus",
  "Disney Plus": "disney-plus",
  "Prime Video": "prime-video",
  "Amazon Prime Video": "prime-video",
  "Apple TV": "apple-tv-plus",
  "Apple TV+": "apple-tv-plus",
  "Paramount+": "paramount-plus",
  "Paramount Plus": "paramount-plus",
  "BBC One": "bbc-iplayer",
  "BBC Two": "bbc-iplayer",
  "BBC iPlayer": "bbc-iplayer",
  ITV: "itvx",
  ITV1: "itvx",
  ITVX: "itvx",
};

// TMDB GB watch-provider IDs -> platform slug
// https://developer.themoviedb.org/reference/watch-providers-movie-list
export const TMDB_PROVIDER_MAP: Record<number, string> = {
  8: "netflix", // Netflix
  337: "disney-plus", // Disney Plus
  9: "prime-video", // Amazon Prime Video
  119: "prime-video", // Amazon Prime Video (alt id)
  350: "apple-tv-plus", // Apple TV+
  531: "paramount-plus", // Paramount+
  38: "bbc-iplayer", // BBC iPlayer
  104: "itvx", // ITVX
};

export function resolvePlatformSlugFromName(name: string | null | undefined): string | null {
  if (!name) return null;
  return TVMAZE_NETWORK_MAP[name] ?? null;
}

export function resolvePlatformSlugFromTmdbProvider(providerId: number): string | null {
  return TMDB_PROVIDER_MAP[providerId] ?? null;
}
