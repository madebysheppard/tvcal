import Link from "next/link";
import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { getWatchlistWithUpcoming } from "@/lib/watchlist";
import { Thumb } from "@/components/thumb";

export default async function WatchlistPage() {
  const watched = await getWatchlistWithUpcoming();

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        <section className="px-4 py-8">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-6 ml-2">
            Your Watchlist
          </h2>

          {watched.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 text-sm mb-4">
                Nothing on your list yet
              </p>
              <Link
                href="/search"
                className="inline-block text-[#FF00AA] hover:text-[#FF66C4] transition-colors text-sm font-medium"
              >
                Browse shows →
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {watched.map((item) => (
                <li key={item.series.id} className="group">
                  <Thumb
                    src={item.series.artwork}
                    title={item.series.title}
                    size={32}
                  />
                  <p className="text-sm font-medium text-stone-100 mt-2 truncate">
                    {item.series.title}
                  </p>
                  {item.nextEpisode && (
                    <p className="text-xs text-stone-500 mt-1">
                      Next: S{item.nextEpisode.seasonNumber} E
                      {item.nextEpisode.episodeNumber}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomTabs />
    </div>
  );
}
