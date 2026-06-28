"use client";

import { useState } from "react";
import { PlatformFilter } from "@/components/platform-filter";
import type { Platform } from "@/db/schema";

export function FilterToggle({
  platforms,
  selectedNames,
}: {
  platforms: Platform[];
  selectedNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const activeCount = selectedNames.length;

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={activeCount > 0 ? `Filter by platform, ${activeCount} active` : "Filter by platform"}
        className={[
          "relative h-11 w-11 flex items-center justify-center rounded-full transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
          open ? "bg-white/[0.08] text-stone-100" : "text-stone-400 hover:text-stone-100 hover:bg-white/[0.06]",
        ].join(" ")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-white/[0.08] bg-[#141210] p-4 shadow-2xl">
          {activeCount > 0 && (
            <p className="text-[12px] text-stone-500 mb-3 truncate">
              <span className="text-amber-400/90">{activeCount} filtered</span>: {selectedNames.join(", ")}
            </p>
          )}
          <PlatformFilter platforms={platforms} />
        </div>
      )}
    </div>
  );
}
