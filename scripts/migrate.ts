// applies supabase/migrations/*.sql in filename order, each once, inside a transaction.
// needs SUPABASE_DB_URL (Supabase -> Connect -> Session pooler). without it, paste the
// files into the Supabase SQL Editor instead, oldest first.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("SUPABASE_DB_URL is not set. Paste supabase/migrations/*.sql into the Supabase SQL Editor instead.");
  process.exit(1);
}

const dir = join(import.meta.dirname, "..", "supabase", "migrations");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

// supabase's pooler cert isn't in node's default trust store
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query(`create schema if not exists app_private;
    create table if not exists app_private.schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await client.query<{ name: string }>("select name from app_private.schema_migrations")).rows.map((r) => r.name));

  const todo = files.filter((f) => !done.has(f));
  if (todo.length === 0) console.log("database is up to date");

  for (const f of todo) {
    await client.query("begin");
    try {
      await client.query(readFileSync(join(dir, f), "utf8"));
      await client.query("insert into app_private.schema_migrations (name) values ($1)", [f]);
      await client.query("commit");
      console.log(`applied ${f}`);
    } catch (err) {
      await client.query("rollback");
      console.error(`failed on ${f}: ${(err as Error).message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await client.end();
}
