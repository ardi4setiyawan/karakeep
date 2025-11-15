// packages/db/drizzle.ts (VERSI MODIFIKASI)

import "dotenv/config";
import * as schema from "./schema";
import path from "path";

// --- IMPORT DRIVER POSTGRES (NEON) ---
import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzlePg } from "drizzle-orm/neon-serverless";
// -------------------------------------

// --- IMPORT DRIVER SQLITE ---
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
// ----------------------------

import serverConfig from "@karakeep/shared/config";
import dbConfig from "./drizzle.config"; // Masih dipakai buat config SQLite fallback

export type DB = ReturnType<typeof drizzlePg | typeof drizzleSqlite>;

// =========================================================================
// == LOGIC KONEKSI DB UTAMA (EXPORT CONST DB) ==
// =========================================================================

// Cek apakah DATABASE_URL (Neon DB) tersedia
const neonDbUrl = process.env.DATABASE_URL;

let db: DB;

if (neonDbUrl && neonDbUrl.startsWith('postgres')) {
    // KONEKSI KE NEON DB (POSTGRES)
    console.log("INFO: Menggunakan NEON DB (Postgres) untuk Koneksi Utama.");
    const pool = new Pool({ connectionString: neonDbUrl });
    db = drizzlePg(pool, { schema, logger: true });

} else {
    // FALLBACK KE SQLITE LOKAL (Development Default)
    console.log("INFO: Menggunakan SQLITE (better-sqlite3) untuk Koneksi Utama.");
    const sqlite = new Database(dbConfig.dbCredentials.url);

    if (serverConfig.database.walMode) {
        sqlite.pragma("journal_mode = WAL");
        sqlite.pragma("synchronous = NORMAL");
    } else {
        sqlite.pragma("journal_mode = DELETE");
    }
    sqlite.pragma("cache_size = -65536");
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("temp_store = MEMORY");

    db = drizzleSqlite(sqlite, { schema });
}

export { db };

// =========================================================================
// == LOGIC GET IN-MEMORY DB (BIARKAN) ==
// =========================================================================

export function getInMemoryDB(runMigrations: boolean) {
  // Logic ini bisa dibiarkan karena khusus In-Memory DB (SQLite)
  const mem = new Database(":memory:");
  const db = drizzleSqlite(mem, { schema, logger: false });
  
  if (runMigrations) {
    // Gunakan migrator SQLite (drizzle-orm/better-sqlite3/migrator)
    migrateSqlite(db, { migrationsFolder: path.resolve(__dirname, "./drizzle") });
  }
  return db;
}