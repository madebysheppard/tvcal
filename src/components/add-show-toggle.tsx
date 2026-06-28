"use client";

import { useState } from "react";
import { SeriesPicker } from "@/components/series-picker";

type SeriesOption = { id: string; title: string; platformName: string; artwork: string | null };

export function AddShowToggle({ series }: { series: SeriesOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/[0.06] pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={[
          "min-h-11 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00AA]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b0a]",
          open
            ? "bg-[#FF00AA] text-stone-950 border-[#FF00AA]"
            : "bg-transparent text-stone-300 border-white/[0.12] hover:border-white/25",
        ].join(" ")}
      >
        {open ? "Close" : "+ Add show"}
      </button>

      {open && (
        <div className="mt-4">
          <SeriesPicker series={series} />
        </div>
      )}
    </div>
  );
}
