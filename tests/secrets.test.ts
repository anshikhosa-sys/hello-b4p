import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findSecrets } from "../scripts/check-secrets.mjs";

describe("secret scanner", () => {
  it("flags a google key and a jwt", () => {
    const fake = ["GEMINI_API_KEY=AIza" + "x".repeat(35), "key=eyJ" + "a".repeat(20) + ".eyJ" + "b".repeat(20) + "." + "c".repeat(20)].join(
      "\n",
    );
    expect(findSecrets(fake).map((h: { name: string }) => h.name)).toEqual(["Google API key", "JWT (e.g. Supabase key)"]);
  });

  it("passes placeholder text", () => {
    expect(findSecrets("GEMINI_API_KEY=your-gemini-api-key")).toEqual([]);
  });
});

describe(".env.example", () => {
  const text = readFileSync(".env.example", "utf8");

  it("contains only placeholders", () => {
    expect(findSecrets(text)).toEqual([]);
  });

  it("lists every variable the app needs", () => {
    for (const name of [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "GEMINI_API_KEY",
      "GEMINI_MODEL",
      "ALLOWED_EMAIL_DOMAIN",
      "ADMIN_EMAILS",
    ]) {
      expect(text).toMatch(new RegExp(`^${name}=`, "m"));
    }
  });
});
