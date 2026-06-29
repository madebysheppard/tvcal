export type TvmazeShow = {
  id: number;
  name: string;
  status: "Running" | "Ended" | "To Be Determined" | string;
  summary: string | null;
  image: { medium?: string; original?: string } | null;
  network: { name: string } | null;
  webChannel: { name: string } | null;
};

export type TvmazeEpisode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string;
  summary: string | null;
  show?: TvmazeShow;
  _embedded?: { show: TvmazeShow };
};

export function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > 0 ? text : null;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Maps TVMaze's three-state show status to our two-state schema column. */
export function mapSeriesStatus(tvmazeStatus: string): "active" | "ended" {
  return tvmazeStatus === "Ended" ? "ended" : "active";
}
