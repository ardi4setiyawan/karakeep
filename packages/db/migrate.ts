import "dotenv/config";
import { db } from "./drizzle";
import { ExitCode } from "typescript";

async function runMigrate() {
  const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');

  if (isPostgres) {
    // 🟢 NEON/POSTGRES MIGRATOR
    console.log("INFO: Menggunakan NEON DB (Postgres) untuk Koneksi Utama.");
    const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrasi selesai di NEON DB!");
  } else {
    // 🟡 SQLITE MIGRATOR (Untuk dev lokal, misalnya)
    console.log("INFO: Menggunakan SQLite untuk Koneksi Utama.");
    const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrasi selesai di SQLite!");
  }

  // Penting: Keluar dari proses setelah migrasi selesai
  process.exit(0);
}

runMigrate().catch((error) => {
  console.error("❌ Migrasi Gagal:", error);
  process.exit(1);
});