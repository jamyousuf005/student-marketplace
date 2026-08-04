import postgres from 'postgres'
import 'dotenv/config'

const runDrop = async () => {
  const connectionString = process.env.DATABASE_URL!
  const sql = postgres(connectionString, { max: 1 })
  
  await sql`DROP SCHEMA public CASCADE;`
  await sql`CREATE SCHEMA public;`
  await sql`GRANT ALL ON SCHEMA public TO postgres;`
  await sql`GRANT ALL ON SCHEMA public TO public;`
  
  console.log('Schema dropped and recreated')
  process.exit(0)
}

runDrop()
