"use server";

import { db } from "@/db";
import { watchlist } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function addToWatchlist(seriesId: string) {
  await db.insert(watchlist).values({ id: randomUUID(), seriesId }).onConflictDoNothing();
  revalidatePath("/");
}

export async function removeFromWatchlist(seriesId: string) {
  await db.delete(watchlist).where(eq(watchlist.seriesId, seriesId));
  revalidatePath("/");
}
