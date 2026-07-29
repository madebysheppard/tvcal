import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { SeriesPicker } from "@/components/series-picker";
import { getAllSeriesForPicker } from "@/lib/watchlist";

export default async function SearchPage() {
  const allSeries = await getAllSeriesForPicker();

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        <section className="px-4 py-8">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-6 ml-2">
            Find & Add Shows
          </h2>
          <SeriesPicker series={allSeries} />
        </section>
      </main>

      <BottomTabs />
    </div>
  );
}
