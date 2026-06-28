export function Thumb({ src, title, size = 10 }: { src: string | null; title: string; size?: number }) {
  const dim = `${size * 0.25}rem`;
  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="shrink-0 rounded-lg bg-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-stone-500"
        style={{ width: dim, height: dim }}
      >
        {title.charAt(0)}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="shrink-0 rounded-lg object-cover"
      style={{ width: dim, height: dim }}
      loading="lazy"
    />
  );
}
