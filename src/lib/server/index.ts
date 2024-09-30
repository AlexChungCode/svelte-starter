import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { D1Database } from "@cloudflare/workers-types";

// Create a function to initialize the database
export function createDB(database: D1Database) {
  return drizzle(database, { schema, logger: false });
}

// Export a type for the database
export type DB = ReturnType<typeof createDB>;

// You can also export a helper function to get the database from the platform
export function getDB(platform: App.Platform) {
  return createDB(platform.env.DATABASE);
}
