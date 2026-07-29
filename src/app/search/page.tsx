import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";

export default async function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0b0a] text-stone-200 pb-20 sm:pb-24">
      <Header />

      <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        <p className="text-stone-500 text-sm text-center py-12">
          Search coming soon
        </p>
      </main>

      <BottomTabs />
    </div>
  );
}
