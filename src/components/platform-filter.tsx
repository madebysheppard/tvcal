"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Platform } from "@/db/schema";

export function PlatformFilter({ platforms }: { platforms: Platform[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  const selected = searchParams.getAll("p");

  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
    setShowFade(remaining > 4);
  }, []);

  useEffect(() => {
    updateFade();
    window.addEventListener("resize", updateFade);
    return () => window.removeEventListener("resize", updateFade);
  }, [updateFade, platforms.length]);

  const toggle = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("p");
      params.delete("p");

      if (current.includes(slug)) {
        current.filter((s) => s !== slug).forEach((s) => params.append("p", s));
      } else {
        current.forEach((s) => params.append("p", s));
        params.append("p", slug);
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("p");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={updateFade}
        role="group"
        aria-label="Filter by platform"
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1"
      >
        {platforms.map((p) => {
          const active = selected.includes(p.slug);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.slug)}
              aria-pressed={active}
              className={[
                "shrink-0 min-h-11 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer whitespace-nowrap",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b0a]",
                active
                  ? "bg-amber-400 text-stone-950 border-amber-400"
                  : "bg-transparent text-stone-400 border-white/[0.1] hover:border-white/20 hover:text-stone-100",
              ].join(" ")}
            >
              {p.name}
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            aria-label="Clear all platform filters"
            className="shrink-0 min-h-11 px-2 text-[13px] text-stone-500 hover:text-stone-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {showFade && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[#0c0b0a] to-transparent"
        />
      )}
    </div>
  );
}
