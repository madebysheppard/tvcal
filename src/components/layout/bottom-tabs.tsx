'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Guide', icon: 'guide' },
  { href: '/search', label: 'Search', icon: 'search' },
  { href: '/watchlist', label: 'Watchlist', icon: 'star' },
];

function TabIcon({ name }: { name: string }) {
  switch (name) {
    case 'guide':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 3v18" />
        </svg>
      );
    case 'search':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      );
    case 'star':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 19.36 25.07 12 19.64 4.64 25.07 6.82 16.70 0 10.27 8.91 10.26 12 2" />
        </svg>
      );
    default:
      return null;
  }
}

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0b0a]/95 backdrop-blur-sm border-t border-white/[0.06] safe-area-inset-bottom animate-fade-in">
      <div className="flex items-stretch h-16 sm:h-20 max-w-7xl mx-auto">
        {tabs.map((tab, idx) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-[#FF00AA]' : 'text-stone-500 hover:text-stone-300'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
              aria-current={isActive ? 'page' : undefined}
            >
              <TabIcon name={tab.icon} />
              <span className="text-[10px] font-medium uppercase tracking-tight hidden sm:inline text-xs sm:text-[11px]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
