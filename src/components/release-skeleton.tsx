export function ReleaseSkeleton() {
  return (
    <ul className="space-y-0 animate-pulse" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center justify-between gap-4 min-h-[3.25rem] py-3 border-b border-white/[0.06] last:border-0">
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-40 bg-white/[0.08] rounded" />
            <span className="block h-2.5 w-56 bg-white/[0.04] rounded" />
          </span>
          <span className="shrink-0 h-2.5 w-16 bg-white/[0.08] rounded" />
        </li>
      ))}
    </ul>
  );
}
