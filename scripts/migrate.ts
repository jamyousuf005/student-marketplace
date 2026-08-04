import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import 'dotenv/config'

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  const connectionString = process.env.DATABASE_URL
  const sql = postgres(connectionString, { max: 1 })
  const db = drizzle(sql)

  console.log('Running migrations...')

  await migrate(db, { migrationsFolder: 'supabase/migrations' })

  console.log('Migrations complete!')
  process.exit(0)
}

runMigrate().catch((err) => {
  console.error('Migration failed!', err)
  process.exit(1)
})
