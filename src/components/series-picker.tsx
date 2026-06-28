"use client";

import { useState } from "react";
import { WatchToggle } from "@/components/watch-toggle";
import { Thumb } from "@/components/thumb";

type SeriesOption = { id: string; title: string; platformName: string; artwork: string | null };

export function SeriesPicker({ series }: { series: SeriesOption[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q ? series.filter((s) => s.title.toLowerCase().includes(q)) : series;

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search shows to add…"
        className="w-full min-h-11 px-4 rounded-full bg-white/[0.04] border border-white/[0.1] text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF00AA]/70 mb-4"
      />
      <ul role="list" className="max-h-96 overflow-y-auto no-scrollbar">
        {filtered.length === 0 && (
          <li className="text-sm text-stone-500 py-6">No shows match &ldquo;{query}&rdquo;.</li>
        )}
        {filtered.slice(0, 60).map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.06] last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Thumb src={s.artwork} title={s.title} size={9} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-100 truncate">{s.title}</p>
                <p className="text-[12px] text-stone-500">{s.platformName}</p>
              </div>
            </div>
            <WatchToggle seriesId={s.id} isWatching={false} variant="block" />
          </li>
        ))}
      </ul>
    </div>
  );
}
