import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const releaseTypeEnum = pgEnum("release_type", [
  "movie",
  "season",
  "episode",
  "documentary",
  "sport",
]);

export const seriesStatusEnum = pgEnum("series_status", ["active", "ended"]);

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

export const platforms = pgTable("platforms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

export const series = pgTable(
  "series",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    artwork: text("artwork"),
    platformId: text("platform_id")
      .notNull()
      .references(() => platforms.id),
    status: seriesStatusEnum("status").notNull().default("active"),
    tmdbId: integer("tmdb_id"),
    tvmazeId: integer("tvmaze_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("series_platform_idx").on(t.platformId),
    index("series_tmdb_idx").on(t.tmdbId),
  ]
);

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

export const releases = pgTable(
  "releases",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    seriesId: text("series_id").references(() => series.id),
    platformId: text("platform_id")
      .notNull()
      .references(() => platforms.id),
    releaseDate: text("release_date").notNull(), // YYYY-MM-DD
    releaseType: releaseTypeEnum("release_type").notNull(),
    seasonNumber: integer("season_number"),
    episodeNumber: integer("episode_number"),
    episodeTitle: text("episode_title"),
    synopsis: text("synopsis"),
    artworkUrl: text("artwork_url"),
    sourceId: text("source_id").notNull(),
    sourceType: text("source_type").notNull().default("manual"), // tmdb | tvmaze | manual
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("releases_date_idx").on(t.releaseDate),
    index("releases_platform_idx").on(t.platformId),
    index("releases_series_idx").on(t.seriesId),
    uniqueIndex("releases_source_idx").on(t.sourceId, t.sourceType),
  ]
);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Better Auth session tables
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Following
// ---------------------------------------------------------------------------

export const following = pgTable(
  "following",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("following_user_series_idx").on(t.userId, t.seriesId),
    index("following_user_idx").on(t.userId),
  ]
);

// ---------------------------------------------------------------------------
// Watchlist ("what we're watching now") — single-user, no auth
// ---------------------------------------------------------------------------

export const watchlist = pgTable(
  "watchlist",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("watchlist_series_idx").on(t.seriesId)]
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Platform = typeof platforms.$inferSelect;
export type Series = typeof series.$inferSelect;
export type Release = typeof releases.$inferSelect;
export type User = typeof users.$inferSelect;
export type Following = typeof following.$inferSelect;

export type NewPlatform = typeof platforms.$inferInsert;
export type NewSeries = typeof series.$inferInsert;
export type NewRelease = typeof releases.$inferInsert;
export type NewFollowing = typeof following.$inferInsert;

export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;
