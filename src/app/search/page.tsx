import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { SeriesPicker } from "@/components/series-picker";
import { getAllSeriesForPicker } from "@/lib/watchlist";
import { db } from "@/db";
import * as schema from "@/db/schema";

export default async function SearchPage() {
  const [allSeries, platforms] = await Promise.all([
    getAllSeriesForPicker(),
    db.select().from(schema.platforms),
  ]);

  // Group series by platform
  const seriesByPlatform = platforms.map((platform) => ({
    platform,
    series: allSeries.filter((s) => s.platformId === platform.id),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20 sm:pb-24">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        {/* Search Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-6">
            Find & Add Shows
          </h2>
          <SeriesPicker series={allSeries} />
        </section>

        {/* Browse by Platform */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-white/[0.06] max-w-7xl mx-auto w-full">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-8">
            Browse by Platform
          </h2>

          <div className="space-y-12">
            {seriesByPlatform.map(({ platform, series }) => (
              series.length > 0 && (
                <div key={platform.id}>
                  <h3 className="text-sm font-semibold text-stone-200 mb-4 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#FF00AA]" />
                    {platform.name}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {series.slice(0, 20).map((show) => (
                      <div
                        key={show.id}
                        className="group relative animate-fade-in-up"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/[0.05] mb-2">
                          {show.artwork && (
                            <img
                              src={show.artwork}
                              alt={show.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
                        </div>
                        <p className="text-xs font-medium text-stone-300 truncate">
                          {show.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  {series.length > 20 && (
                    <p className="text-xs text-stone-500 mt-3">
                      +{series.length - 20} more
                    </p>
                  )}
                </div>
              )
            ))}
          </div>
        </section>
      </main>

      <BottomTabs />
    </div>
  );
}
