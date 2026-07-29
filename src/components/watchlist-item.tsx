'use client';

import { Thumb } from './thumb';
import type { WatchedShow } from '@/lib/watchlist';

interface WatchlistItemProps {
  show: WatchedShow;
  onRemove?: (seriesId: string) => void;
}

export function WatchlistItem({ show, onRemove }: WatchlistItemProps) {
  return (
    <div className="group relative flex flex-col animate-fade-in-up">
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-3">
        <Thumb src={show.series.artwork} title={show.series.title} size={32} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-end p-3">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-full">
            {onRemove && (
              <button
                onClick={() => onRemove(show.series.id)}
                className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 backdrop-blur-sm"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="font-semibold text-stone-50 text-sm leading-tight truncate">
          {show.series.title}
        </h3>
        {show.nextEpisode && (
          <p className="text-xs text-stone-500 mt-1 truncate">
            Next: S{show.nextEpisode.seasonNumber} E{show.nextEpisode.episodeNumber}
          </p>
        )}
        {!show.nextEpisode && (
          <p className="text-xs text-stone-600 mt-1 italic">Ended</p>
        )}
      </div>
    </div>
  );
}
