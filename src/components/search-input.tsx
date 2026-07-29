'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get('q') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <input
      type="text"
      value={input}
      onChange={handleChange}
      placeholder="Search shows..."
      className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#FF00AA]/50 focus:bg-white/[0.08] transition-colors mb-8"
      autoFocus
    />
  );
}
