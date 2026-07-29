'use client';

import type { ReleaseWithRelations } from "@/lib/releases";
import { WatchToggle } from "@/components/watch-toggle";
import { Thumb } from "@/components/thumb";
import { useOptimistic } from "react";
import { watchShowAction } from "@/lib/watchlist-actions";

function episodeMeta(r: ReleaseWithRelations): string | null {
  if (r.releaseType === "episode" && r.seasonNumber && r.episodeNumber) {
    return `S${r.seasonNumber} E${r.episodeNumber}`;
  }
  if (r.releaseType === "season" && r.seasonNumber) {
    return `Season ${r.seasonNumber}`;
  }
  return null;
}

export function ReleaseItem({ release }: { release: ReleaseWithRelations }) {
  const showTitle = release.series?.title ?? release.title;
  const episodeCode = episodeMeta(release);
  const platformName = release.platform.name;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
      <Thumb src={release.series?.artwork ?? release.artworkUrl} title={showTitle} size={14} />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="font-semibold text-stone-50 text-base leading-tight">
          {showTitle}
        </h3>
        <p className="text-sm text-stone-400">
          {episodeCode && <span className="font-mono mr-2">{episodeCode}</span>}
          <span>{platformName}</span>
        </p>
        {release.episodeTitle && (
          <p className="text-sm text-stone-500 italic">
            "{release.episodeTitle}"
          </p>
        )}
      </div>

      {release.series && (
        <div className="shrink-0 pt-1">
          <WatchToggle seriesId={release.series.id} isWatching={false} />
        </div>
      )}
    </div>
  );
}
