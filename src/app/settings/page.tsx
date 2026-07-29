import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        <section className="px-4 py-8">
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-stone-400 mb-6 ml-2">
            Settings
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/[0.04]">
              <h3 className="font-semibold text-stone-50 mb-1">About</h3>
              <p className="text-sm text-stone-400">
                Streaming Guide v0.1.0
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.04]">
              <h3 className="font-semibold text-stone-50 mb-2">Data Sources</h3>
              <ul className="text-sm text-stone-400 space-y-1">
                <li>TV schedules: TVMaze API</li>
                <li>Movies: The Movie Database (TMDB)</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-white/[0.04]">
              <h3 className="font-semibold text-stone-50 mb-1">Privacy</h3>
              <p className="text-sm text-stone-400">
                Your watchlist is stored locally on your device.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomTabs />
    </div>
  );
}
