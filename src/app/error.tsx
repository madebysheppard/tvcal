"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-sm px-4">
        <h1 className="text-lg font-semibold text-zinc-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          {error.message || "We couldn't load the guide. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 text-xs font-medium rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
