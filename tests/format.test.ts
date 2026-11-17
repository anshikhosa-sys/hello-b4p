import { describe, expect, it } from "vitest";
import { addDays, daysUntil, formatAward, formatDate, formatMoney, initials, todayISO } from "@/lib/format";

describe("dates", () => {
  // 3am UTC on Nov 18 is still Nov 17 in Ann Arbor
  const lateEvening = new Date("2026-11-18T03:00:00Z");

  it("uses Ann Arbor's date for today", () => {
    expect(todayISO(lateEvening)).toBe("2026-11-17");
  });

  it("counts whole days to a deadline", () => {
    expect(daysUntil("2026-11-17", lateEvening)).toBe(0);
    expect(daysUntil("2026-12-01", lateEvening)).toBe(14);
    expect(daysUntil("2026-11-10", lateEvening)).toBe(-7);
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-12-25", 10)).toBe("2027-01-04");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("formats dates without shifting the day", () => {
    expect(formatDate("2026-12-01")).toBe("Dec 1");
    expect(formatDate("2026-12-01", true)).toBe("Dec 1, 2026");
  });
});

describe("money", () => {
  it("shortens round thousands", () => {
    expect(formatMoney(5000)).toBe("$5k");
    expect(formatMoney(2500)).toBe("$2,500");
    expect(formatMoney(750)).toBe("$750");
  });

  it("shows missing award data plainly instead of as zero", () => {
    expect(formatAward(null, null)).toBe("Award not listed");
    expect(formatAward(null, 2000)).toBe("Up to $2k");
    expect(formatAward(500, null)).toBe("From $500");
    expect(formatAward(5000, 25000)).toBe("$5k – $25k");
    expect(formatAward(1000, 1000)).toBe("$1k");
  });
});

describe("initials", () => {
  it("takes first and last name", () => {
    expect(initials("Sample Member A")).toBe("SA");
    expect(initials("Ansh K.")).toBe("AK");
    expect(initials("Priya")).toBe("P");
    expect(initials("")).toBe("?");
  });
});
