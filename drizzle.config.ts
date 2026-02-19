import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use non-pooling URL for DDL operations (migrations, push, pull)
    url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL!,
  },
})
