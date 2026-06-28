"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedDate = searchParams.get("date") ?? todayStr;

  const [viewYear, setViewYear] = useState(() => parseInt(selectedDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(selectedDate.slice(5, 7)) - 1);

  // Keep the displayed month in sync when the date changes externally (e.g. prev/next-day links).
  useEffect(() => {
    setViewYear(parseInt(selectedDate.slice(0, 4)));
    setViewMonth(parseInt(selectedDate.slice(5, 7)) - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }, [viewMonth]);

  const selectDate = useCallback(
    (dateStr: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "calendar");
      params.set("date", dateStr);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const jumpToToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }, [today]);

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full max-w-xs select-none rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="h-11 w-11 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-50 hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00AA]/70"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-100 tracking-wide">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          {!isCurrentMonth && (
            <button
              onClick={jumpToToday}
              className="text-[11px] text-[#FF00AA]/90 hover:text-[#FF33BD] transition-colors cursor-pointer"
            >
              Jump to today
            </button>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="h-11 w-11 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-50 hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00AA]/70"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-stone-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = isoDate(viewYear, viewMonth, day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={i}
              onClick={() => selectDate(dateStr)}
              className={[
                "text-[13px] tabular-nums h-11 w-full rounded-full transition-colors cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00AA]/70",
                isSelected
                  ? "bg-[#FF00AA] text-stone-950 font-semibold"
                  : isToday
                  ? "text-[#FF00AA] font-semibold ring-1 ring-[#FF00AA]/40"
                  : "text-stone-300 hover:bg-white/[0.06]",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
