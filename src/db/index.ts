import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.POSTGRES_URL ?? ''

// Supabase PostgreSQL via postgres.js — connection-pooled
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client, { schema })

export { db }
export default db
