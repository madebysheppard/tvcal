/**
 * Ingestion script — pulls real TV schedules (TVMaze) and movie releases
 * (TMDB) for GB and upserts them into the database.
 * Run: npx tsx src/db/ingest.ts
 *
 * Requires DATABASE_URL and TMDB_API_KEY in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { fetchTvmazeReleases } from "@/lib/ingest/tvmaze";
import { fetchTmdbReleases } from "@/lib/ingest/tmdb";

const RANGE_DAYS = 14; // today..+13

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

async function ingest() {
  // Imported dynamically so DATABASE_URL from dotenv.config() above is set
  // before these modules read process.env at module-eval time.
  const { db } = await import("./index");
  const schema = await import("./schema");
  const { upsertSeries, upsertRelease } = await import("@/lib/ingest/upsert");

  const platforms = await db.select().from(schema.platforms);
  const platformIdBySlug = new Map(platforms.map((p) => [p.slug, p.id]));

  const dates = Array.from({ length: RANGE_DAYS }, (_, i) => daysFromNow(i));
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  console.log(`Fetching TVMaze schedules for ${startDate}..${endDate}...`);
  const tvmaze = await fetchTvmazeReleases(dates, platformIdBySlug);
  console.log(`  ${tvmaze.series.length} series, ${tvmaze.releases.length} episodes, ${tvmaze.skipped} skipped (unmapped platform)`);

  for (const series of tvmaze.series) {
    await upsertSeries(series);
  }
  for (const release of tvmaze.releases) {
    await upsertRelease(release);
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.warn("\nTMDB_API_KEY not set — skipping movie ingestion.");
  } else {
    console.log(`\nFetching TMDB movie releases for ${startDate}..${endDate}...`);
    const tmdb = await fetchTmdbReleases(startDate, endDate, apiKey, platformIdBySlug);
    console.log(`  ${tmdb.releases.length} releases, ${tmdb.skipped} skipped (no mapped platform)`);

    for (const release of tmdb.releases) {
      await upsertRelease(release);
    }
  }

  console.log("\nDone.");
}

ingest().catch((err) => {
  console.error(err);
  process.exit(1);
});
