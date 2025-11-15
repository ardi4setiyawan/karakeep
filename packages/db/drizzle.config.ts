// packages/db/drizzle.config.ts

// ... impor dan serverConfig (biarkan)

// Kita TIDAK lagi mengambil URL dari serverConfig.dataDir
// Kita ambil URL dari Environment Variable (DATABASE_URL)
const databaseURL = process.env.DATABASE_URL;

if (!databaseURL) {
  throw new Error("DATABASE_URL must be set for Drizzle Config!");
}

export default {
  dialect: "postgresql", // <-- UBAH KE POSTGRESQL
  schema: "./schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseURL, // <-- AMBIL DARI ENV
  },
} satisfies Config;