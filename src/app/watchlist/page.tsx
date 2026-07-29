import Link from "next/link";
import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { getWatchlistWithUpcoming } from "@/lib/watchlist";
import { WatchlistItem } from "@/components/watchlist-item";

export default async function WatchlistPage() {
  const watched = await getWatchlistWithUpcoming();

  // Sort by next episode date (shows with upcoming episodes first)
  const sorted = [...watched].sort((a, b) => {
    if (a.nextEpisode && !b.nextEpisode) return -1;
    if (!a.nextEpisode && b.nextEpisode) return 1;
    if (a.nextEpisode && b.nextEpisode) {
      return a.nextEpisode.releaseDate.localeCompare(b.nextEpisode.releaseDate);
    }
    return a.series.title.localeCompare(b.series.title);
  });

  const activeShows = sorted.filter((s) => s.nextEpisode);
  const endedShows = sorted.filter((s) => !s.nextEpisode);

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20 sm:pb-24">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        {watched.length === 0 ? (
          <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
            <p className="text-stone-500 text-sm mb-4">
              Nothing on your list yet
            </p>
            <Link
              href="/search"
              className="inline-block text-[#FF00AA] hover:text-[#FF66C4] transition-colors text-sm font-medium animate-scale-in"
            >
              Browse shows →
            </Link>
          </section>
        ) : (
          <>
            {/* Active Shows */}
            {activeShows.length > 0 && (
              <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-6">
                  Watching
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-stagger">
                  {activeShows.map((item) => (
                    <WatchlistItem key={item.series.id} show={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Ended Shows */}
            {endedShows.length > 0 && (
              <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-white/[0.06]">
                <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-6">
                  Ended
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-stagger">
                  {endedShows.map((item) => (
                    <WatchlistItem key={item.series.id} show={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
