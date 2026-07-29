'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Platform {
  id: string;
  name: string;
}

interface PlatformFiltersProps {
  platforms: Platform[];
}

export function PlatformFilters({ platforms }: PlatformFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlatforms = searchParams.get('platforms')?.split(',') || [];

  const togglePlatform = (platformId: string) => {
    const newSelected = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId];

    const params = new URLSearchParams();
    if (newSelected.length > 0) {
      params.set('platforms', newSelected.join(','));
    }

    const queryString = params.toString();
    router.push(queryString ? `/app?${queryString}` : '/app');
  };

  const clearFilters = () => {
    router.push('/app');
  };

  return (
    <div className="sticky top-16 sm:top-20 z-30 bg-[#0c0b0a]/95 backdrop-blur-sm border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 py-3 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {/* All button */}
          <button
            onClick={clearFilters}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedPlatforms.length === 0
                ? 'bg-[#FF00AA] text-white'
                : 'bg-white/[0.08] text-stone-300 hover:bg-white/[0.12]'
            }`}
          >
            All
          </button>

          {/* Platform chips */}
          {platforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#FF00AA] text-white'
                    : 'bg-white/[0.08] text-stone-300 hover:bg-white/[0.12]'
                }`}
              >
                {platform.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
