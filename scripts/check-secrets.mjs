// scans the staged diff (or files passed as args) for key-like strings.
// run before every push: npm run check:secrets
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const patterns = [
  ["Google API key", /AIza[0-9A-Za-z_-]{35}/],
  ["JWT (e.g. Supabase key)", /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{20,}/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{30,}/],
  ["OpenAI/Anthropic-style key", /sk-(ant-)?[A-Za-z0-9_-]{24,}/],
  ["Private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["Postgres URL with password", /postgres(ql)?:\/\/[^:\s]+:[^@\s]{6,}@/],
  ["Google OAuth client secret", /GOCSPX-[A-Za-z0-9_-]{20,}/],
];

export function findSecrets(text) {
  const hits = [];
  text.split("\n").forEach((line, i) => {
    for (const [name, re] of patterns) if (re.test(line)) hits.push({ line: i + 1, name, text: line.trim().slice(0, 120) });
  });
  return hits;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const files = process.argv.slice(2);
  const sources = files.length
    ? files.map((f) => [f, readFileSync(f, "utf8")])
    : [["staged diff", execSync("git diff --cached -U0 --no-color", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })]];

  // staged env files are a problem on their own, whatever they contain
  const staged = files.length ? [] : execSync("git diff --cached --name-only", { encoding: "utf8" }).split("\n").filter(Boolean);
  const envFiles = staged.filter((f) => /(^|\/)\.env/.test(f) && !f.endsWith(".env.example"));

  let bad = envFiles.length > 0;
  for (const f of envFiles) console.error(`staged env file: ${f}`);
  for (const [label, text] of sources) {
    for (const h of findSecrets(text)) {
      bad = true;
      console.error(`${label}:${h.line} looks like a ${h.name}: ${h.text}`);
    }
  }
  if (bad) {
    console.error("\npossible secret found. unstage it before pushing.");
    process.exit(1);
  }
  console.log("no secrets found");
}
