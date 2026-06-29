import { stripHtml, mapSeriesStatus, type TvmazeShow, type TvmazeEpisode } from "./tvmaze-shared";

export type TvmazeSearchResult = {
  tvmazeId: number;
  title: string;
  artwork: string | null;
  network: string | null;
  status: "active" | "ended";
  premiered: string | null;
  ended: string | null;
  summary: string | null;
};

export async function searchTvmazeShows(query: string): Promise<TvmazeSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`);
  if (!res.ok) return [];

  const data: { show: TvmazeShow & { premiered?: string | null; ended?: string | null } }[] = await res.json();

  return data.slice(0, 20).map(({ show }) => ({
    tvmazeId: show.id,
    title: show.name,
    artwork: show.image?.original ?? show.image?.medium ?? null,
    network: show.network?.name ?? show.webChannel?.name ?? null,
    status: mapSeriesStatus(show.status),
    premiered: show.premiered ?? null,
    ended: show.ended ?? null,
    summary: stripHtml(show.summary),
  }));
}

export async function fetchTvmazeShow(tvmazeId: number): Promise<TvmazeShow | null> {
  const res = await fetch(`https://api.tvmaze.com/shows/${tvmazeId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTvmazeShowEpisodes(tvmazeId: number): Promise<TvmazeEpisode[]> {
  const res = await fetch(`https://api.tvmaze.com/shows/${tvmazeId}/episodes`);
  if (!res.ok) return [];
  return res.json();
}
