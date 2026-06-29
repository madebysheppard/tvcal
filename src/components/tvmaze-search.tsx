"use client";

import { useState, useTransition } from "react";
import { searchTvmazeShowsAction, addShowFromTvmaze } from "@/lib/add-show-actions";
import { Thumb } from "@/components/thumb";

type Result = Awaited<ReturnType<typeof searchTvmazeShowsAction>>[number];

export function TvmazeSearch({ query }: { query: string }) {
  const [results, setResults] = useState<Result[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, startSearch] = useTransition();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  if (!query.trim()) return null;

  const runSearch = () => {
    setSearched(true);
    startSearch(async () => {
      const r = await searchTvmazeShowsAction(query);
      setResults(r);
    });
  };

  const handleAdd = async (tvmazeId: number) => {
    setAddingId(tvmazeId);
    const res = await addShowFromTvmaze(tvmazeId);
    setAddingId(null);
    if (res.ok) setAddedIds((prev) => new Set(prev).add(tvmazeId));
  };

  if (!searched) {
    return (
      <button
        onClick={runSearch}
        className="text-[12px] text-stone-500 hover:text-stone-200 transition-colors py-3"
      >
        Can&apos;t find it? Search TVMaze for &ldquo;{query}&rdquo; →
      </button>
    );
  }

  if (searching) {
    return <p className="text-sm text-stone-500 py-3">Searching TVMaze…</p>;
  }

  if (!results || results.length === 0) {
    return <p className="text-sm text-stone-500 py-3">No TVMaze results for &ldquo;{query}&rdquo;.</p>;
  }

  return (
    <ul role="list" className="mt-1">
      {results.map((r) => {
        const isAdded = addedIds.has(r.tvmazeId);
        const isAdding = addingId === r.tvmazeId;
        return (
          <li
            key={r.tvmazeId}
            className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.06] last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Thumb src={r.artwork} title={r.title} size={9} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-100 truncate">{r.title}</p>
                <p className="text-[12px] text-stone-500 truncate">
                  {r.network ?? "Unknown network"} · {r.status === "ended" ? "Ended" : "Running"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAdd(r.tvmazeId)}
              disabled={isAdding || isAdded}
              className={[
                "min-h-11 px-4 text-[13px] font-medium rounded-full border transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF00AA]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0b0a]",
                isAdded
                  ? "bg-[#FF00AA] text-stone-950 border-[#FF00AA]"
                  : "bg-transparent text-stone-300 border-white/[0.12] hover:border-white/25",
              ].join(" ")}
            >
              {isAdded ? "Added" : isAdding ? "Adding…" : "+ Add"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
