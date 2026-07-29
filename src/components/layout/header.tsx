'use client';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0b0a]/95 backdrop-blur-sm border-b border-white/[0.06] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <h1 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl font-bold text-stone-50 tracking-tight text-center">
          Streaming Guide
        </h1>
      </div>
    </header>
  );
}
