'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const isGuide = pathname?.includes('/app');

  return (
    <header className="sticky top-0 z-40 bg-[#0c0b0a]/95 backdrop-blur-sm border-b border-white/[0.06] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Menu icon */}
        <button
          aria-label="Menu"
          className="h-10 w-10 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/[0.06] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {/* Center: Title */}
        <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold text-stone-50 tracking-tight flex-1 text-center">
          Streaming Guide
        </h1>

        {/* Right: Nav icons */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search shows"
            className="h-10 w-10 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/[0.06] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
          <Link
            href="/app?view=calendar"
            aria-label="Calendar view"
            className="h-10 w-10 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/[0.06] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
