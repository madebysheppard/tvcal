import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { SearchInput } from "@/components/search-input";
import { getAllSeriesForPicker, getWatchedSeriesIds } from "@/lib/watchlist";
import { WatchToggle } from "@/components/watch-toggle";

type SeriesForPicker = Awaited<ReturnType<typeof getAllSeriesForPicker>>[number];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  const watched = await getWatchedSeriesIds();

  let results: SeriesForPicker[] = [];
  if (query.trim()) {
    const allSeries = await getAllSeriesForPicker();
    const lowerQuery = query.toLowerCase();
    results = allSeries
      .filter((s: SeriesForPicker) => s.title.toLowerCase().includes(lowerQuery))
      .slice(0, 50);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20 sm:pb-24">
      <Header />

      <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        <SearchInput />

        {/* Results */}
        {query.trim() && (
          <>
            {results.length === 0 ? (
              <p className="text-stone-500 text-sm text-center py-12">
                No shows found matching "{query}"
              </p>
            ) : (
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-500 font-medium mb-6">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-3">
                  {results.map((show) => (
                    <div
                      key={show.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                    >
                      {show.artwork && (
                        <img
                          src={show.artwork}
                          alt={show.title}
                          className="w-12 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-50 text-sm truncate">
                          {show.title}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 truncate">
                          {show.platformName}
                        </p>
                      </div>
                      <WatchToggle
                        seriesId={show.id}
                        isWatching={watched.has(show.id)}
                        variant="block"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!query.trim() && (
          <p className="text-stone-500 text-sm text-center py-12">
            Search for shows to get started
          </p>
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
