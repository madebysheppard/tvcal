/**
 * Seed script — populates platforms and releases for UI development.
 * Run: npx tsx src/db/seed.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { randomUUID, createHash } from "crypto";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

const TODAY = daysFromNow(0);

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

const PLATFORMS: schema.NewPlatform[] = [
  { id: "netflix", name: "Netflix", slug: "netflix" },
  { id: "disney-plus", name: "Disney+", slug: "disney-plus" },
  { id: "prime-video", name: "Prime Video", slug: "prime-video" },
  { id: "apple-tv-plus", name: "Apple TV+", slug: "apple-tv-plus" },
  { id: "paramount-plus", name: "Paramount+", slug: "paramount-plus" },
  { id: "bbc-iplayer", name: "BBC iPlayer", slug: "bbc-iplayer" },
  { id: "itvx", name: "ITVX", slug: "itvx" },
];

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

const SERIES: schema.NewSeries[] = [
  {
    id: "andor",
    title: "Andor",
    slug: "andor",
    description: "The story of the rebellion against the Empire.",
    platformId: "disney-plus",
    status: "active",
    tmdbId: 83867,
  },
  {
    id: "murderbot",
    title: "Murderbot",
    slug: "murderbot",
    description: "A part-human, part-robot security construct navigates a universe it didn't ask to be part of.",
    platformId: "apple-tv-plus",
    status: "active",
    tmdbId: 136315,
  },
  {
    id: "ginny-georgia",
    title: "Ginny & Georgia",
    slug: "ginny-georgia",
    description: "Free-spirited Georgia and her daughter Ginny move to a small New England town.",
    platformId: "netflix",
    status: "active",
    tmdbId: 85271,
  },
  {
    id: "dept-q",
    title: "Dept. Q",
    slug: "dept-q",
    description: "A Copenhagen cold case detective unit tackles unsolved murders.",
    platformId: "netflix",
    status: "active",
  },
  {
    id: "stick",
    title: "Stick",
    slug: "stick",
    description: "A retired golf coach mentors a young rising star.",
    platformId: "apple-tv-plus",
    status: "active",
  },
  {
    id: "the-last-of-us",
    title: "The Last of Us",
    slug: "the-last-of-us",
    description: "A hardened survivor and a teenage girl traverse a post-apocalyptic America.",
    platformId: "netflix",
    status: "active",
    tmdbId: 100088,
  },
  {
    id: "fallout",
    title: "Fallout",
    slug: "fallout",
    description: "A wealthy young woman emerges from her vault 200 years after the nuclear apocalypse.",
    platformId: "prime-video",
    status: "active",
    tmdbId: 106379,
  },
  {
    id: "silo",
    title: "Silo",
    slug: "silo",
    description: "In a future where humanity lives underground in a giant silo, one engineer uncovers the truth.",
    platformId: "apple-tv-plus",
    status: "active",
    tmdbId: 125988,
  },
  {
    id: "severance",
    title: "Severance",
    slug: "severance",
    description: "Employees undergo a procedure to surgically divide their work and personal memories.",
    platformId: "apple-tv-plus",
    status: "active",
    tmdbId: 95396,
  },
  {
    id: "star-trek-strange-new-worlds",
    title: "Star Trek: Strange New Worlds",
    slug: "star-trek-strange-new-worlds",
    description: "Captain Pike and the crew of the USS Enterprise explore the galaxy.",
    platformId: "paramount-plus",
    status: "active",
    tmdbId: 103516,
  },
];

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

type SeedRelease = {
  seriesId: string;
  platformId: string;
  title: string;
  releaseDate: string;
  releaseType: "episode" | "movie" | "season" | "documentary" | "sport";
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;
  synopsis?: string;
};

const RELEASES: SeedRelease[] = [
  // --- Today ---
  {
    seriesId: "andor",
    platformId: "disney-plus",
    title: "Andor — S2E8: The Walls of Ghorman",
    releaseDate: TODAY,
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 8,
    episodeTitle: "The Walls of Ghorman",
    synopsis: "The rebellion faces its most dangerous test yet on the streets of Ghorman.",
  },
  {
    seriesId: "ginny-georgia",
    platformId: "netflix",
    title: "Ginny & Georgia — S3E1: Back to the Beginning",
    releaseDate: TODAY,
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 1,
    episodeTitle: "Back to the Beginning",
  },
  {
    seriesId: "dept-q",
    platformId: "netflix",
    title: "Dept. Q — Season 1",
    releaseDate: TODAY,
    releaseType: "season",
    seasonNumber: 1,
    synopsis: "The complete first season of the Copenhagen cold case drama.",
  },
  {
    platformId: "netflix",
    seriesId: undefined as unknown as string,
    title: "The Brutalist",
    releaseDate: TODAY,
    releaseType: "movie",
    synopsis: "An epic story of a visionary architect who escapes post-war Europe.",
  },
  {
    platformId: "prime-video",
    seriesId: undefined as unknown as string,
    title: "The Substance",
    releaseDate: TODAY,
    releaseType: "movie",
    synopsis: "A body-horror film about a woman who tries a black-market drug with radical side effects.",
  },

  // --- Tomorrow ---
  {
    seriesId: "murderbot",
    platformId: "apple-tv-plus",
    title: "Murderbot — S1E6: Escape Route",
    releaseDate: daysFromNow(1),
    releaseType: "episode",
    seasonNumber: 1,
    episodeNumber: 6,
    episodeTitle: "Escape Route",
  },
  {
    seriesId: "stick",
    platformId: "apple-tv-plus",
    title: "Stick — S1E5: The Back Nine",
    releaseDate: daysFromNow(1),
    releaseType: "episode",
    seasonNumber: 1,
    episodeNumber: 5,
    episodeTitle: "The Back Nine",
  },

  // --- Day 2 ---
  {
    seriesId: "fallout",
    platformId: "prime-video",
    title: "Fallout — S2E1: The Surface",
    releaseDate: daysFromNow(2),
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 1,
    episodeTitle: "The Surface",
    synopsis: "A new chapter begins above ground.",
  },
  {
    platformId: "bbc-iplayer",
    seriesId: undefined as unknown as string,
    title: "Dinosaurs: The Final Day with David Attenborough",
    releaseDate: daysFromNow(2),
    releaseType: "documentary",
    synopsis: "David Attenborough investigates the extraordinary story of the last day of the dinosaurs.",
  },

  // --- Day 3 ---
  {
    seriesId: "silo",
    platformId: "apple-tv-plus",
    title: "Silo — S3E4: Level 40",
    releaseDate: daysFromNow(3),
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 4,
    episodeTitle: "Level 40",
  },
  {
    seriesId: "the-last-of-us",
    platformId: "netflix",
    title: "The Last of Us — S2E7: When We Are in Need",
    releaseDate: daysFromNow(3),
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 7,
    episodeTitle: "When We Are in Need",
  },

  // --- Day 4 ---
  {
    seriesId: "star-trek-strange-new-worlds",
    platformId: "paramount-plus",
    title: "Star Trek: Strange New Worlds — S3E9",
    releaseDate: daysFromNow(4),
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 9,
  },
  {
    platformId: "netflix",
    seriesId: undefined as unknown as string,
    title: "Conclave",
    releaseDate: daysFromNow(4),
    releaseType: "movie",
    synopsis: "A cardinal navigates the secretive process of selecting a new Pope.",
  },

  // --- Day 5 ---
  {
    seriesId: "andor",
    platformId: "disney-plus",
    title: "Andor — S2E9: Ghorman Front",
    releaseDate: daysFromNow(5),
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 9,
    episodeTitle: "Ghorman Front",
  },
  {
    seriesId: "severance",
    platformId: "apple-tv-plus",
    title: "Severance — S3E1: Hello, Ms. Cobel",
    releaseDate: daysFromNow(5),
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 1,
    episodeTitle: "Hello, Ms. Cobel",
    synopsis: "The severed floor faces a new threat.",
  },
  {
    platformId: "itvx",
    seriesId: undefined as unknown as string,
    title: "A Gentleman in Moscow",
    releaseDate: daysFromNow(5),
    releaseType: "movie",
    synopsis: "A count sentenced to house arrest in a Moscow hotel discovers a life full of adventure.",
  },

  // --- Day 6 ---
  {
    seriesId: "murderbot",
    platformId: "apple-tv-plus",
    title: "Murderbot — S1E7: Sanctuary",
    releaseDate: daysFromNow(6),
    releaseType: "episode",
    seasonNumber: 1,
    episodeNumber: 7,
    episodeTitle: "Sanctuary",
  },
  {
    seriesId: "silo",
    platformId: "apple-tv-plus",
    title: "Silo — S3E5: The Referendum",
    releaseDate: daysFromNow(6),
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 5,
    episodeTitle: "The Referendum",
  },
  {
    platformId: "prime-video",
    seriesId: undefined as unknown as string,
    title: "Good One",
    releaseDate: daysFromNow(6),
    releaseType: "movie",
    synopsis: "A teenage girl embarks on a backpacking trip with her father and his complicated friend.",
  },

  // --- Day 7 ---
  {
    seriesId: "andor",
    platformId: "disney-plus",
    title: "Andor — S2E10: Force Forty",
    releaseDate: daysFromNow(7),
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 10,
    episodeTitle: "Force Forty",
  },
  {
    seriesId: "the-last-of-us",
    platformId: "netflix",
    title: "The Last of Us — S2E8: The Price",
    releaseDate: daysFromNow(7),
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 8,
    episodeTitle: "The Price",
  },
  {
    platformId: "bbc-iplayer",
    seriesId: undefined as unknown as string,
    title: "Wolf Hall: The Mirror and the Light",
    releaseDate: daysFromNow(7),
    releaseType: "season",
    seasonNumber: 1,
    synopsis: "The final chapter of Hilary Mantel's trilogy about Thomas Cromwell.",
  },

  // --- Day 8–14: a smattering ---
  {
    seriesId: "fallout",
    platformId: "prime-video",
    title: "Fallout — S2E2: The Wasteland",
    releaseDate: daysFromNow(9),
    releaseType: "episode",
    seasonNumber: 2,
    episodeNumber: 2,
    episodeTitle: "The Wasteland",
  },
  {
    seriesId: "stick",
    platformId: "apple-tv-plus",
    title: "Stick — S1E6: The Pro-Am",
    releaseDate: daysFromNow(8),
    releaseType: "episode",
    seasonNumber: 1,
    episodeNumber: 6,
    episodeTitle: "The Pro-Am",
  },
  {
    seriesId: "severance",
    platformId: "apple-tv-plus",
    title: "Severance — S3E2: Overtime",
    releaseDate: daysFromNow(12),
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 2,
    episodeTitle: "Overtime",
  },
  {
    seriesId: "star-trek-strange-new-worlds",
    platformId: "paramount-plus",
    title: "Star Trek: Strange New Worlds — S3E10 (Season Finale)",
    releaseDate: daysFromNow(11),
    releaseType: "episode",
    seasonNumber: 3,
    episodeNumber: 10,
  },
  {
    platformId: "netflix",
    seriesId: undefined as unknown as string,
    title: "Emilia Pérez",
    releaseDate: daysFromNow(10),
    releaseType: "movie",
    synopsis: "A cartel boss asks a lawyer to help her fake her death and finally live as a woman.",
  },
  {
    platformId: "disney-plus",
    seriesId: undefined as unknown as string,
    title: "Moana 2",
    releaseDate: daysFromNow(14),
    releaseType: "movie",
    synopsis: "Moana embarks on a new voyage with a crew of unlikely sailors.",
  },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Seeding platforms...");
  await db
    .insert(schema.platforms)
    .values(PLATFORMS)
    .onConflictDoNothing();
  console.log(`  ${PLATFORMS.length} platforms`);

  console.log("Seeding series...");
  await db
    .insert(schema.series)
    .values(SERIES)
    .onConflictDoNothing();
  console.log(`  ${SERIES.length} series`);

  console.log("Seeding releases...");
  const releaseRows: schema.NewRelease[] = RELEASES.map((r) => ({
    id: randomUUID(),
    title: r.title,
    seriesId: r.seriesId ?? null,
    platformId: r.platformId,
    releaseDate: r.releaseDate,
    releaseType: r.releaseType,
    seasonNumber: r.seasonNumber ?? null,
    episodeNumber: r.episodeNumber ?? null,
    episodeTitle: r.episodeTitle ?? null,
    synopsis: r.synopsis ?? null,
    artworkUrl: null,
    // Deterministic so re-running the seed doesn't insert duplicates.
    // Real ingestion uses TMDB/TVMaze IDs as sourceId instead.
    sourceId: createHash("sha1").update(`${r.platformId}:${r.title}:${r.releaseDate}`).digest("hex"),
    sourceType: "manual",
  }));

  await db
    .insert(schema.releases)
    .values(releaseRows)
    .onConflictDoNothing();
  console.log(`  ${releaseRows.length} releases`);

  console.log("\nDone.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
