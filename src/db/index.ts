import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: any;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else if (process.env.NODE_ENV === "development") {
  // Mock database for development without a real connection
  class ChainableQuery {
    constructor(private data: any = []) {}

    where() {
      return this;
    }

    limit() {
      return this;
    }

    innerJoin() {
      return this;
    }

    leftJoin() {
      return this;
    }

    orderBy() {
      return this;
    }

    returning() {
      return Promise.resolve(this.data);
    }

    then(resolve: any) {
      return Promise.resolve(this.data).then(resolve);
    }

    catch(reject: any) {
      return Promise.resolve(this.data).catch(reject);
    }

    finally(callback: any) {
      return Promise.resolve(this.data).finally(callback);
    }

    [Symbol.toStringTag] = "Promise";
  }

  db = {
    select: (fields?: any) => ({
      from: (table?: any) => new ChainableQuery([]),
    }),

    insert: (table?: any) => ({
      values: (values?: any) => ({
        onConflictDoUpdate: (options?: any) => new ChainableQuery(),
        onConflictDoNothing: (options?: any) => ({
          returning: () => Promise.resolve([]),
        }),
      }),
      onConflictDoNothing: (options?: any) => ({
        returning: () => Promise.resolve([]),
      }),
    }),

    update: (table?: any) => ({
      set: (values?: any) => ({
        where: (condition?: any) => Promise.resolve(),
      }),
    }),

    delete: (table?: any) => ({
      where: (condition?: any) => Promise.resolve(),
    }),

    transaction: async (fn: (tx: any) => Promise<any>) => fn(db),
  };
} else {
  throw new Error(
    "DATABASE_URL environment variable is required in production. Set it in your .env.local file."
  );
}

export { db };
