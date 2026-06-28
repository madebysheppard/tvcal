"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const TABS = [
  { key: "watching", label: "Watching" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
] as const;

export function ViewTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = searchParams.get("view") ?? "watching";

  const select = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === "watching") {
        params.delete("view");
        params.delete("date");
      } else {
        params.set("view", key);
        if (key !== "calendar") params.delete("date");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div role="tablist" aria-label="Browse releases" className="flex items-center gap-6 overflow-x-auto no-scrollbar min-w-0">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => select(tab.key)}
            className={[
              "relative shrink-0 min-h-11 px-0.5 text-[15px] font-medium transition-colors cursor-pointer whitespace-nowrap",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00AA]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b0a] rounded-sm",
              isActive ? "text-stone-50" : "text-stone-500 hover:text-stone-300",
            ].join(" ")}
          >
            {tab.label}
            <span
              className={[
                "absolute left-0 right-0 -bottom-px h-[2px] rounded-full transition-opacity",
                isActive ? "bg-[#FF00AA] opacity-100" : "opacity-0",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
