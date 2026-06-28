import type { ReleaseWithRelations } from "@/lib/releases";
import { WatchToggle } from "@/components/watch-toggle";

function episodeMeta(r: ReleaseWithRelations): { code: string | null; subtitle: string | null } {
  const code =
    r.releaseType === "episode" && r.seasonNumber && r.episodeNumber
      ? `S${r.seasonNumber} E${r.episodeNumber}`
      : r.releaseType === "season" && r.seasonNumber
      ? `Season ${r.seasonNumber}`
      : null;

  const subtitle =
    r.episodeTitle ??
    (r.releaseType === "episode" && r.title !== r.series?.title
      ? r.title.split("—").pop()?.split(":").pop()?.trim() ?? null
      : null);

  return { code, subtitle };
}

/** Detects comma-separated guest/cast lists (e.g. panel shows) so they aren't styled as a literal episode title. */
function isGuestList(subtitle: string): boolean {
  const parts = subtitle.split(",").map((s) => s.trim());
  if (parts.length < 3) return false;
  return parts.every((p) => /^[A-Z][a-zA-Z.'-]*(\s+[A-Z][a-zA-Z.'-]*)+$/.test(p));
}

function collapsedMeta(group: ReleaseWithRelations[]): string {
  const sorted = [...group].sort(
    (a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0)
  );
  const season = sorted[0].seasonNumber;
  const first = sorted[0].episodeNumber;
  const last = sorted[sorted.length - 1].episodeNumber;
  const prefix = season ? `S${season} ` : "";
  const range = first && last && first !== last ? `E${first}–E${last}` : first ? `E${first}` : "";
  const count = `${group.length} episodes`;
  return [prefix + range, count].filter(Boolean).join(" · ");
}

export function ReleaseItem({
  group,
  watchedSeriesIds,
}: {
  group: ReleaseWithRelations[];
  watchedSeriesIds: Set<string>;
}) {
  const first = group[0];
  const showTitle = first.series?.title ?? first.title;

  const isCollapsed = group.length > 1;
  const { code, subtitle } = isCollapsed ? { code: null, subtitle: null } : episodeMeta(first);
  const meta = isCollapsed ? collapsedMeta(group) : null;
  const guestList = subtitle && isGuestList(subtitle);

  return (
    <li className="group relative flex items-center justify-between gap-4 min-h-[3.25rem] py-3 border-b border-white/[0.06] last:border-0 transition-colors -mx-4 px-4 hover:bg-white/[0.025]">
      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[2px] bg-[#FF00AA] transition-all duration-200 group-hover:h-2/3" />

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-stone-50 leading-snug truncate">
          {showTitle}
        </p>
        {(code || subtitle || meta) && (
          <p className="text-[13px] text-stone-400 mt-0.5 leading-snug truncate">
            {meta ?? (
              <>
                {code && <span className="font-mono tabular-nums text-stone-400 mr-2">{code}</span>}
                {subtitle && guestList && <span className="text-stone-500">Guests: {subtitle}</span>}
                {subtitle && !guestList && <span className="text-stone-500">&ldquo;{subtitle}&rdquo;</span>}
              </>
            )}
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500 whitespace-nowrap">
          {first.platform.name}
        </span>
        {first.series && (
          <WatchToggle seriesId={first.series.id} isWatching={watchedSeriesIds.has(first.series.id)} />
        )}
      </div>
    </li>
  );
}
