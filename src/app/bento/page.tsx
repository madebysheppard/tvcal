import Link from "next/link";
import type { CSSProperties } from "react";
import { getReleasesForRange, groupByDate } from "@/lib/releases";
import { getWatchlistWithUpcoming, getAllSeriesForPicker } from "@/lib/watchlist";
import type { WatchedShow } from "@/lib/watchlist";
import { SeriesPicker } from "@/components/series-picker";
import { Thumb } from "@/components/thumb";

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayDateString(): string {
  return localDateString(new Date());
}

function formatHeading(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
    weekdayShort: d.toLocaleDateString("en-GB", { weekday: "short" }),
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
  };
}

/** Tile entrance: pure CSS stagger, no client JS / animation libs needed for this concept. */
function tileStyle(index: number): CSSProperties {
  return { animationDelay: `${index * 60}ms` };
}

export default async function BentoConceptPage() {
  const todayStr = todayDateString();

  const [watched, weekReleases, allSeries] = await Promise.all([
    getWatchlistWithUpcoming(),
    getReleasesForRange(0, 6),
    getAllSeriesForPicker(),
  ]);

  const upcomingWatched = watched
    .filter((w): w is WatchedShow & { nextEpisode: NonNullable<WatchedShow["nextEpisode"]> } => !!w.nextEpisode)
    .sort((a, b) => a.nextEpisode.releaseDate.localeCompare(b.nextEpisode.releaseDate));

  const heroShow = upcomingWatched[0] ?? null;
  const streamShows = upcomingWatched.slice(heroShow ? 1 : 0, heroShow ? 7 : 6);

  const watchedIds = new Set(watched.map((w) => w.series.id));
  const pickerOptions = allSeries.filter((s) => !watchedIds.has(s.id));

  const watchedWeekReleases = weekReleases.filter((r) => r.series && watchedIds.has(r.series.id));

  const weekPreview = groupByDate(watchedWeekReleases)
    .filter(({ date }) => date >= todayStr)
    .map(({ date, releases }) => {
      const first = releases[0];
      return {
        date,
        title: first.series?.title ?? first.title,
        platform: first.platform.name,
        artworkUrl: first.artworkUrl,
        extra: releases.length - 1,
      };
    })
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-stone-200">
      <style>{`
        @keyframes tile-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tile-enter { animation: tile-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .tile-enter { animation: none; }
        }
      `}</style>

      <header className="border-b border-white/[0.06] px-6 py-5 max-w-[1400px] mx-auto flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium">Concept</p>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-stone-50 tracking-tight">
            Streaming Guide — Bento
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/?view=calendar"
            aria-label="Open calendar"
            className="h-11 w-11 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-100 hover:bg-white/[0.06] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18" />
              <path d="M8 3v4" />
              <path d="M16 3v4" />
            </svg>
          </Link>
          <Link
            href="/"
            className="text-[13px] text-stone-400 hover:text-stone-100 transition-colors px-3 py-2 rounded-full border border-white/[0.1] hover:border-white/25"
          >
            ← Back to app
          </Link>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 [grid-auto-rows:minmax(120px,auto)]">

          {/* HERO — Up Next, image-backed stage */}
          <section
            aria-labelledby="bento-heading-upnext"
            className="tile-enter md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl min-h-[22rem] flex flex-col justify-end p-7"
            style={tileStyle(0)}
          >
            {heroShow?.series.artwork && (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroShow.series.artwork})` }}
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10"
            />
            {!heroShow?.series.artwork && (
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
            )}

            <div className="relative z-10">
              <h2 id="bento-heading-upnext" className="text-[11px] uppercase tracking-[0.18em] text-white/70 font-semibold mb-3">Up Next</h2>
              {heroShow ? (
                <>
                  <p className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-white leading-[1.05] tracking-tight">
                    {heroShow.series.title}
                  </p>
                  <p className="text-white/70 text-sm mt-3">
                    {heroShow.nextEpisode.seasonNumber && heroShow.nextEpisode.episodeNumber && (
                      <span className="font-mono tabular-nums text-white/80 mr-2">
                        S{heroShow.nextEpisode.seasonNumber} E{heroShow.nextEpisode.episodeNumber}
                      </span>
                    )}
                    {heroShow.nextEpisode.episodeTitle && <span>&ldquo;{heroShow.nextEpisode.episodeTitle}&rdquo;</span>}
                  </p>

                  <div className="flex items-end justify-between mt-6">
                    <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#FF66C4]">
                      {formatHeading(heroShow.nextEpisode.releaseDate).weekday} {formatHeading(heroShow.nextEpisode.releaseDate).date}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-white/80 border border-white/25 rounded-full px-3 py-1.5">
                      {heroShow.platform.name}
                    </span>
                  </div>

                  {streamShows.length > 0 && (
                    <p className="text-white/50 text-[12px] mt-4">
                      +{streamShows.length} more show{streamShows.length === 1 ? "" : "s"} on your list
                    </p>
                  )}
                </>
              ) : (
                <p className="text-white/70 text-sm max-w-[28ch]">
                  Nothing on deck. Add a show below to see it staged here.
                </p>
              )}
            </div>
          </section>

          {/* WATCHING THIS WEEK — merged: only watchlist shows airing in the next 7 days */}
          <section
            aria-labelledby="bento-heading-thisweek"
            className="tile-enter md:col-span-2 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 flex flex-col"
            style={tileStyle(1)}
          >
            <h2 id="bento-heading-thisweek" className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium mb-4">Watching This Week</h2>

            {weekPreview.length === 0 ? (
              <p className="text-stone-500 text-sm flex-1">
                {watched.length === 0
                  ? "Nothing on your list yet — add a show below."
                  : "Nothing from your watchlist airs in the next 7 days."}
              </p>
            ) : (
              <ul className="space-y-3 flex-1">
                {weekPreview.map((item) => {
                  const isToday = item.date === todayStr;
                  return (
                    <li key={item.date} className="flex items-center gap-3">
                      <span
                        className={[
                          "shrink-0 h-9 w-9 flex items-center justify-center rounded-xl text-[10px] font-semibold uppercase tracking-wide",
                          isToday ? "bg-[#FF00AA] text-white" : "border border-[#FF00AA]/30 text-[#FF00AA]",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {formatHeading(item.date).weekdayShort}
                      </span>
                      <Thumb src={item.artworkUrl} title={item.title} />
                      <div className="min-w-0">
                        <p className="text-stone-100 text-sm font-medium truncate">{item.title}</p>
                        <p className="text-stone-500 text-[12px] truncate">
                          {item.platform}
                          {item.extra > 0 && ` · +${item.extra} more`}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href="/"
              className="mt-4 text-[12px] text-stone-500 hover:text-stone-200 transition-colors inline-flex items-center gap-1"
            >
              Manage watchlist →
            </Link>
          </section>

          {/* ADD SHOW — full-width, deliberately open/borderless to break the rounded-card sameness */}
          <section
            aria-labelledby="bento-heading-addshow"
            className="tile-enter md:col-span-4 border-t border-white/[0.08] pt-6"
            style={tileStyle(3)}
          >
            <h2 id="bento-heading-addshow" className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium mb-4">Add Show</h2>
            <SeriesPicker series={pickerOptions} />
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.06] mt-4">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-600">
          <span>Concept — Premium Bento</span>
          <span>TV data: TVMaze · TMDB</span>
        </div>
      </footer>
    </div>
  );
}
