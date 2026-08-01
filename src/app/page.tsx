import { getReleasesForRange, groupByDate } from "@/lib/releases";
import { getWatchlistWithUpcoming } from "@/lib/watchlist";
import type { WatchedShow } from "@/lib/watchlist";
import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { ReleaseItem } from "@/components/release-item";

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
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }),
  };
}

export default async function GuidePage() {
  const todayStr = todayDateString();

  const [watched, weekReleases] = await Promise.all([
    getWatchlistWithUpcoming(),
    getReleasesForRange(0, 13),
  ]);

  const upcomingWatched = watched
    .filter((w): w is WatchedShow & { nextEpisode: NonNullable<WatchedShow["nextEpisode"]> } => !!w.nextEpisode)
    .sort((a, b) => a.nextEpisode.releaseDate.localeCompare(b.nextEpisode.releaseDate));

  const heroShow = upcomingWatched[0] ?? null;

  const watchedIds = new Set(watched.map((w) => w.series.id));

  const watchedWeekReleases = weekReleases.filter((r) => r.series && watchedIds.has(r.series.id));
  const dateGroups = groupByDate(watchedWeekReleases).filter(({ date }) => date >= todayStr);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20 sm:pb-24">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        {/* Featured Hero */}
        {heroShow && (
          <section className="relative overflow-hidden h-64 sm:h-80 md:h-96 flex flex-col justify-end p-6 sm:p-8 animate-fade-in-up">
            {heroShow.series.artwork && (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroShow.series.artwork})` }}
              />
            )}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/50 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-2xl">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  {heroShow.series.title}
                </h2>
              </div>

              <p className="text-stone-300 text-sm md:text-base">
                {heroShow.nextEpisode.seasonNumber && heroShow.nextEpisode.episodeNumber && (
                  <span className="font-mono text-white/80 mr-2">
                    S{heroShow.nextEpisode.seasonNumber} E{heroShow.nextEpisode.episodeNumber}
                  </span>
                )}
                {heroShow.nextEpisode.episodeTitle && `"${heroShow.nextEpisode.episodeTitle}"`}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[#FF00AA] font-semibold">
                  {formatHeading(heroShow.nextEpisode.releaseDate).weekday}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-white/70 border border-white/25 rounded-full px-3 py-1">
                  {heroShow.platform.name}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* This Week Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 max-w-7xl mx-auto w-full">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 ml-2">
            This Week
          </h2>

          {dateGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 text-sm">
                {watched.length === 0
                  ? "Nothing on your list yet — search to add shows."
                  : "Nothing from your watchlist airs in the next 2 weeks."}
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-stagger">
              {dateGroups.map(({ date, releases }) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wide px-2">
                    {formatHeading(date).weekday}
                    <span className="font-normal text-stone-500 ml-2">{formatHeading(date).date}</span>
                  </h3>
                  <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {releases.map((release) => (
                      <li key={release.id}>
                        <ReleaseItem release={release} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomTabs />
    </div>
  );
}
