import { Suspense } from "react";
import { getWatchedSeriesIds, getWatchlistWithUpcoming, getAllSeriesForPicker } from "@/lib/watchlist";
import type { WatchedShow } from "@/lib/watchlist";
import { ReleaseSkeleton } from "@/components/release-skeleton";
import { WatchToggle } from "@/components/watch-toggle";
import { AddShowToggle } from "@/components/add-show-toggle";
import { Thumb } from "@/components/thumb";
import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";

function formatHeading(dateStr: string): { weekday: string; date: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
  };
}

function formatNextAirs(ep: {
  releaseDate: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
}): string {
  const d = new Date(`${ep.releaseDate}T00:00:00`);
  const dateLabel = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const code = ep.seasonNumber && ep.episodeNumber ? `S${ep.seasonNumber} E${ep.episodeNumber} · ` : "";
  const title = ep.episodeTitle ? ` "${ep.episodeTitle}"` : "";
  return `${code}${dateLabel}${title}`;
}

function watchedStatusLine(show: WatchedShow): string {
  if (show.nextEpisode) return formatNextAirs(show.nextEpisode);

  if (show.series.status === "ended") {
    if (show.lastEpisode?.seasonNumber && show.lastEpisode?.episodeNumber) {
      return `Series ended · last aired S${show.lastEpisode.seasonNumber} E${show.lastEpisode.episodeNumber}`;
    }
    return "Series ended";
  }

  return "No upcoming episodes scheduled";
}

function groupWatchedByDate(shows: WatchedShow[]): { dateGroups: { date: string; shows: WatchedShow[] }[]; noDate: WatchedShow[] } {
  const map = new Map<string, WatchedShow[]>();
  const noDate: WatchedShow[] = [];
  for (const s of shows) {
    if (!s.nextEpisode) {
      noDate.push(s);
      continue;
    }
    const arr = map.get(s.nextEpisode.releaseDate) ?? [];
    arr.push(s);
    map.set(s.nextEpisode.releaseDate, arr);
  }
  const dateGroups = Array.from(map.keys())
    .sort()
    .map((date) => ({ date, shows: map.get(date)! }));
  return { dateGroups, noDate };
}

function WatchedRow({ show }: { show: WatchedShow }) {
  const { series: s, platform } = show;
  return (
    <li className="flex items-center justify-between gap-4 min-h-[3.25rem] py-3 border-b border-white/[0.06] last:border-0">
      <div className="min-w-0 flex-1 flex items-center gap-3">
        <Thumb src={s.artwork} title={s.title} size={10} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-stone-50 truncate">{s.title}</p>
          <p className="text-[13px] text-stone-400 mt-0.5 truncate">{watchedStatusLine(show)}</p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500 whitespace-nowrap">
          {platform.name}
        </span>
        <WatchToggle seriesId={s.id} isWatching={true} />
      </div>
    </li>
  );
}

async function WatchingView() {
  const [shows, allSeries] = await Promise.all([getWatchlistWithUpcoming(), getAllSeriesForPicker()]);
  const watchedIds = new Set(shows.map((s) => s.series.id));
  const pickerOptions = allSeries.filter((s) => !watchedIds.has(s.id));
  const { dateGroups, noDate } = groupWatchedByDate(shows);

  return (
    <section aria-labelledby="heading-watching">
      <h2 id="heading-watching" className="sr-only">Shows you&apos;re watching</h2>

      {shows.length === 0 ? (
        <p className="text-sm text-stone-500 py-6 mb-4">
          You&apos;re not watching anything yet — add a show below to see its upcoming episodes here.
        </p>
      ) : (
        <div className="space-y-8 mb-10">
          {dateGroups.map(({ date, shows: dayShows }) => {
            const { weekday, date: dateLabel } = formatHeading(date);
            return (
              <div key={date}>
                <div className="flex items-baseline gap-2.5 mb-2">
                  <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-stone-50">{weekday}</h3>
                  <span className="text-sm text-stone-500">{dateLabel}</span>
                </div>
                <ul role="list">
                  {dayShows.map((show) => (
                    <WatchedRow key={show.series.id} show={show} />
                  ))}
                </ul>
              </div>
            );
          })}

          {noDate.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-stone-400 mb-2">No date scheduled</h3>
              <ul role="list">
                {noDate.map((show) => (
                  <WatchedRow key={show.series.id} show={show} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <AddShowToggle series={pickerOptions} />
    </section>
  );
}

export default async function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20 sm:pb-24">
      <Header />

      <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        <Suspense fallback={<ReleaseSkeleton />}>
          <WatchingView />
        </Suspense>
      </main>

      <BottomTabs />
    </div>
  );
}
