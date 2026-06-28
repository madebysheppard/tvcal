import { Suspense } from "react";
import Link from "next/link";
import {
  getTodayReleases,
  getReleasesForDate,
  getReleasesForRange,
  getAllPlatforms,
  groupByDate,
} from "@/lib/releases";
import type { ReleaseWithRelations } from "@/lib/releases";
import type { Platform } from "@/db/schema";
import { getWatchedSeriesIds, getWatchlistWithUpcoming, getAllSeriesForPicker } from "@/lib/watchlist";
import type { WatchedShow } from "@/lib/watchlist";
import { ReleaseItem } from "@/components/release-item";
import { FilterToggle } from "@/components/filter-toggle";
import { ReleaseSkeleton } from "@/components/release-skeleton";
import { CalendarPicker } from "@/components/calendar-picker";
import { ViewTabs } from "@/components/view-tabs";
import { WatchToggle } from "@/components/watch-toggle";
import { AddShowToggle } from "@/components/add-show-toggle";

function formatHeading(dateStr: string): { weekday: string; date: string; day: string; month: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
    day: d.toLocaleDateString("en-GB", { day: "numeric" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }),
  };
}

function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayDateString(): string {
  return localDateString(new Date());
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDateString(d);
}

function buildHref(view: "today" | "calendar", date: string, platformSlugs: string[]): string {
  const params = new URLSearchParams();
  if (view === "calendar") {
    params.set("view", "calendar");
    params.set("date", date);
  }
  platformSlugs.forEach((s) => params.append("p", s));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function sortByTitle(releases: ReleaseWithRelations[]) {
  return [...releases].sort((a, b) => {
    const ta = (a.series?.title ?? a.title).toLowerCase();
    const tb = (b.series?.title ?? b.title).toLowerCase();
    return ta.localeCompare(tb);
  });
}

function groupByShow(releases: ReleaseWithRelations[]): ReleaseWithRelations[][] {
  const map = new Map<string, ReleaseWithRelations[]>();
  for (const r of sortByTitle(releases)) {
    const key = `${r.series?.id ?? r.id}::${r.platform.id}`;
    const group = map.get(key) ?? [];
    group.push(r);
    map.set(key, group);
  }
  return Array.from(map.values());
}

function ReleaseList({
  releases,
  emptyLabel,
  watchedSeriesIds,
}: {
  releases: ReleaseWithRelations[];
  emptyLabel: string;
  watchedSeriesIds: Set<string>;
}) {
  const groups = groupByShow(releases);
  if (groups.length === 0) {
    return (
      <p className="text-sm text-stone-500 py-10">
        {emptyLabel || "Nothing scheduled for this day yet — check back closer to the date."}
      </p>
    );
  }
  return (
    <ul role="list">
      {groups.map((group) => (
        <ReleaseItem key={group[0].id} group={group} watchedSeriesIds={watchedSeriesIds} />
      ))}
    </ul>
  );
}

async function resolvePlatformIds(platformSlugs: string[]) {
  if (!platformSlugs.length) return undefined;
  const all = await getAllPlatforms();
  return all.filter((p) => platformSlugs.includes(p.slug)).map((p) => p.id);
}

function summaryText(count: number): string {
  return count === 0 ? "Nothing scheduled" : count === 1 ? "1 show" : `${count} shows`;
}

function DateStage({
  eyebrow,
  weekday,
  day,
  month,
  count,
  nextLabel,
  nextHref,
}: {
  eyebrow: string;
  weekday: string;
  day: string;
  month: string;
  count: number;
  nextLabel?: string;
  nextHref?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent px-6 py-6 mb-8">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-widest text-stone-500 font-medium mb-3">{eyebrow}</p>
        {nextHref && nextLabel && (
          <Link
            href={nextHref}
            className="text-[13px] text-amber-400/90 hover:text-amber-300 transition-colors -mt-1"
          >
            {nextLabel} ›
          </Link>
        )}
      </div>
      <div className="flex items-baseline gap-4">
        <span className="font-[family-name:var(--font-heading)] text-6xl font-bold text-amber-400 tabular-nums leading-none">
          {day}
        </span>
        <div className="flex flex-col">
          <span className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-50 leading-tight">
            {weekday}
          </span>
          <span className="text-sm text-stone-500 uppercase tracking-wide">{month}</span>
        </div>
      </div>
      <p className="text-sm text-stone-400 mt-4">{summaryText(count)}</p>
    </div>
  );
}

function CompactDayHeading({
  weekday,
  date,
  count,
  prevHref,
  nextHref,
}: {
  weekday: string;
  date: string;
  count: number;
  prevHref: string;
  nextHref: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-stone-50">
          {weekday}, {date}
        </h2>
        <p className="text-sm text-stone-500 mt-0.5">{summaryText(count)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={prevHref}
          aria-label="Previous day"
          className="h-11 w-11 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-50 hover:bg-white/[0.06] transition-colors"
        >
          ‹
        </Link>
        <Link
          href={nextHref}
          aria-label="Next day"
          className="h-11 w-11 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-50 hover:bg-white/[0.06] transition-colors"
        >
          ›
        </Link>
      </div>
    </div>
  );
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
  const { series: s, platform, nextEpisode } = show;
  return (
    <li className="flex items-center justify-between gap-4 min-h-[3.25rem] py-3 border-b border-white/[0.06] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-stone-50 truncate">{s.title}</p>
        <p className="text-[13px] text-stone-400 mt-0.5 truncate">
          {nextEpisode ? formatNextAirs(nextEpisode) : "No upcoming episodes scheduled"}
        </p>
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

async function TodayView({
  platformSlugs,
  watchedSeriesIds,
  allPlatforms,
  selectedPlatformNames,
}: {
  platformSlugs: string[];
  watchedSeriesIds: Set<string>;
  allPlatforms: Platform[];
  selectedPlatformNames: string[];
}) {
  const platformIds = await resolvePlatformIds(platformSlugs);
  const rows = await getTodayReleases(platformIds);
  const todayStr = todayDateString();
  const { weekday, day, month } = formatHeading(todayStr);

  return (
    <section aria-labelledby="heading-today">
      <h2 id="heading-today" className="sr-only">Today's releases</h2>
      <DateStage
        eyebrow="Today"
        weekday={weekday}
        day={day}
        month={month}
        count={groupByShow(rows).length}
        nextLabel="Tomorrow"
        nextHref={buildHref("calendar", shiftDate(todayStr, 1), platformSlugs)}
      />
      <div className="flex justify-end mb-4">
        <Suspense>
          <FilterToggle platforms={allPlatforms} selectedNames={selectedPlatformNames} />
        </Suspense>
      </div>
      <ReleaseList
        releases={rows}
        emptyLabel={`No releases today${platformSlugs.length ? " for the selected platforms" : ""}.`}
        watchedSeriesIds={watchedSeriesIds}
      />
    </section>
  );
}

async function WeekView({
  platformSlugs,
  watchedSeriesIds,
  allPlatforms,
  selectedPlatformNames,
}: {
  platformSlugs: string[];
  watchedSeriesIds: Set<string>;
  allPlatforms: Platform[];
  selectedPlatformNames: string[];
}) {
  const platformIds = await resolvePlatformIds(platformSlugs);
  const rows = await getReleasesForRange(0, 6, platformIds);
  const days = groupByDate(rows);

  if (days.length === 0) {
    return (
      <p className="text-sm text-stone-500 py-10">
        No releases this week{platformSlugs.length ? " for the selected platforms" : ""}.
      </p>
    );
  }

  return (
    <section aria-labelledby="heading-week">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">This week</p>
        <Suspense>
          <FilterToggle platforms={allPlatforms} selectedNames={selectedPlatformNames} />
        </Suspense>
      </div>
      <h2 id="heading-week" className="sr-only">This week's releases</h2>
      <div className="space-y-9 mt-5">
        {days.map(({ date, releases: dayReleases }) => {
          const { weekday, date: dateLabel } = formatHeading(date);
          return (
            <div key={date}>
              <div className="flex items-baseline gap-2.5 mb-2">
                <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-stone-50">{weekday}</h3>
                <span className="text-sm text-stone-500">{dateLabel}</span>
              </div>
              <ReleaseList releases={dayReleases} emptyLabel="" watchedSeriesIds={watchedSeriesIds} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

async function CalendarView({
  platformSlugs,
  date,
  watchedSeriesIds,
}: {
  platformSlugs: string[];
  date: string;
  watchedSeriesIds: Set<string>;
}) {
  const platformIds = await resolvePlatformIds(platformSlugs);
  const rows = await getReleasesForDate(date, platformIds);
  const { weekday, date: dateLabel } = formatHeading(date);

  return (
    <section aria-labelledby="heading-calendar">
      <div className="flex justify-center mb-8">
        <CalendarPicker />
      </div>
      <h2 id="heading-calendar" className="sr-only">Releases on selected date</h2>
      <CompactDayHeading
        weekday={weekday}
        date={dateLabel}
        count={groupByShow(rows).length}
        prevHref={buildHref("calendar", shiftDate(date, -1), platformSlugs)}
        nextHref={buildHref("calendar", shiftDate(date, 1), platformSlugs)}
      />
      <ReleaseList
        releases={rows}
        emptyLabel={`No releases on this date${platformSlugs.length ? " for the selected platforms" : ""}.`}
        watchedSeriesIds={watchedSeriesIds}
      />
    </section>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string | string[]; date?: string; view?: string }>;
}) {
  const params = await searchParams;
  const platformSlugs = Array.isArray(params.p) ? params.p : params.p ? [params.p] : [];
  const view =
    params.view === "today" || params.view === "week" || params.view === "calendar"
      ? params.view
      : "watching";
  const todayStr = todayDateString();
  const selectedDate = params.date ?? todayStr;

  const [allPlatforms, watchedSeriesIds] = await Promise.all([getAllPlatforms(), getWatchedSeriesIds()]);
  const selectedPlatformNames = allPlatforms
    .filter((p) => platformSlugs.includes(p.slug))
    .map((p) => p.name);
  const calendarHref = buildHref("calendar", selectedDate, platformSlugs);

  return (
    <div className="min-h-screen bg-[#0c0b0a]">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0c0b0a]/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-50">
              Streaming Guide
            </h1>
            <Link
              href={calendarHref}
              aria-label="Open calendar"
              aria-current={view === "calendar" ? "page" : undefined}
              className={[
                "h-11 w-11 flex items-center justify-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
                view === "calendar"
                  ? "bg-white/[0.08] text-stone-100"
                  : "text-stone-400 hover:text-stone-100 hover:bg-white/[0.06]",
              ].join(" ")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 3v4" />
                <path d="M16 3v4" />
              </svg>
            </Link>
          </div>

          <Suspense>
            <ViewTabs />
          </Suspense>
        </div>
      </header>

      <main id="main-content" className="max-w-2xl mx-auto px-5 py-8">
        <Suspense fallback={<ReleaseSkeleton />}>
          {view === "watching" && <WatchingView />}
          {view === "today" && (
            <TodayView
              platformSlugs={platformSlugs}
              watchedSeriesIds={watchedSeriesIds}
              allPlatforms={allPlatforms}
              selectedPlatformNames={selectedPlatformNames}
            />
          )}
          {view === "week" && (
            <WeekView
              platformSlugs={platformSlugs}
              watchedSeriesIds={watchedSeriesIds}
              allPlatforms={allPlatforms}
              selectedPlatformNames={selectedPlatformNames}
            />
          )}
          {view === "calendar" && (
            <CalendarView platformSlugs={platformSlugs} date={selectedDate} watchedSeriesIds={watchedSeriesIds} />
          )}
        </Suspense>
      </main>

      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-2xl mx-auto px-5 py-6 flex items-center justify-between text-[11px] uppercase tracking-widest text-stone-600">
          <span>TV data: TVMaze · TMDB</span>
          <span>UK · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
