// loads the sample data set into supabase. only touches rows with is_sample = true,
// so it's safe to run again and never removes real grants or applications.
// usage: npm run seed            (load / refresh sample rows)
//        npm run seed -- --clear (remove sample rows only)
import { createClient } from "@supabase/supabase-js";
import { sampleData } from "../lib/sample-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function step(label: string, run: () => PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await run();
  if (error) {
    console.error(`${label} failed: ${error.message}`);
    process.exit(1);
  }
  console.log(`  ${label}`);
}

const clearOnly = process.argv.includes("--clear");
const data = sampleData();

console.log("removing old sample rows");
await step("applications", () => db.from("applications").delete().eq("is_sample", true));
// scores go with their grants (on delete cascade)
await step("grants", () => db.from("grants").delete().eq("is_sample", true));
await step("members", () => db.from("members").delete().eq("is_sample", true));

if (!clearOnly) {
  console.log("inserting sample rows");
  await step(`${data.members.length} members`, () => db.from("members").insert(data.members));
  await step(`${data.grants.length} grants`, () => db.from("grants").insert(data.grants));
  await step(`${data.scores.length} scores`, () => db.from("grant_scores").insert(data.scores));
  await step(`${data.applications.length} applications`, () => db.from("applications").insert(data.applications));
}
console.log(clearOnly ? "sample data removed" : 'sample data loaded (shown as "Sample data" in the app)');
