"use client";

import { useTransition } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/lib/watchlist-actions";

export function WatchToggle({
  seriesId,
  isWatching,
  variant = "inline",
}: {
  seriesId: string;
  isWatching: boolean;
  variant?: "inline" | "block";
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      if (isWatching) await removeFromWatchlist(seriesId);
      else await addToWatchlist(seriesId);
    });
  };

  if (variant === "block") {
    return (
      <button
        onClick={toggle}
        disabled={pending}
        aria-pressed={isWatching}
        className={[
          "min-h-11 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b0a]",
          isWatching
            ? "bg-amber-400 text-stone-950 border-amber-400"
            : "bg-transparent text-stone-300 border-white/[0.12] hover:border-white/25",
        ].join(" ")}
      >
        {isWatching ? "Watching" : "+ Add"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={isWatching}
      aria-label={isWatching ? "Remove from watchlist" : "Add to watchlist"}
      className={[
        "shrink-0 h-11 w-11 flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
        isWatching ? "text-amber-400" : "text-stone-500 hover:text-stone-200 hover:bg-white/[0.06]",
      ].join(" ")}
      title={isWatching ? "Watching" : "Add to watchlist"}
    >
      {isWatching ? "★" : "☆"}
    </button>
  );
}
