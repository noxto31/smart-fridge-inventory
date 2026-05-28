import { describe, it, expect } from "vitest";
import {
  calculateShelfLife,
  getExpiryStatus,
  daysUntilExpiry,
} from "@/lib/utils/shelf-life-calculator";

describe("calculateShelfLife", () => {
  it("冷藏未开封猪肉保质期为 3 天", () => {
    const result = calculateShelfLife("meat", "fridge", false, "2026-01-01");
    expect(result.shelfLifeDays).toBe(3);
    expect(result.expiryDate).toBe("2026-01-04");
  });

  it("冷藏已开封猪肉保质期为 2 天", () => {
    const result = calculateShelfLife("meat", "fridge", true, "2026-01-01");
    expect(result.shelfLifeDays).toBe(2);
    expect(result.expiryDate).toBe("2026-01-03");
  });

  it("冷冻未开封猪肉保质期为 180 天", () => {
    const result = calculateShelfLife("meat", "freezer", false, "2026-01-01");
    expect(result.shelfLifeDays).toBe(180);
  });

  it("手动指定日期优先", () => {
    const result = calculateShelfLife("meat", "fridge", false, "2026-01-01", "2026-03-01");
    expect(result.expiryDate).toBe("2026-03-01");
    expect(result.shelfLifeDays).toBe(59); // Jan 1 to Mar 1 = 59 days
  });

  it("未知分类使用兜底值", () => {
    const result = calculateShelfLife("other", "fridge", false, "2026-01-01");
    expect(result.shelfLifeDays).toBe(7);
  });

  it("冷藏蔬菜保质期", () => {
    const result = calculateShelfLife("vegetable", "fridge", false, "2026-01-01");
    expect(result.shelfLifeDays).toBeGreaterThan(0);
  });

  it("冷冻海鲜保质期", () => {
    const result = calculateShelfLife("seafood", "freezer", false, "2026-01-01");
    expect(result.shelfLifeDays).toBe(120);
  });

  it("开封后保质期应缩短", () => {
    const unopened = calculateShelfLife("dairy", "fridge", false, "2026-01-01");
    const opened = calculateShelfLife("dairy", "fridge", true, "2026-01-01");
    expect(opened.shelfLifeDays).toBeLessThan(unopened.shelfLifeDays);
  });
});

describe("getExpiryStatus", () => {
  it("过去日期返回 expired", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getExpiryStatus(formatDate(yesterday))).toBe("expired");
  });

  it("今天返回 urgent", () => {
    const today = new Date();
    expect(getExpiryStatus(formatDate(today))).toBe("urgent");
  });

  it("明天返回 urgent", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getExpiryStatus(formatDate(tomorrow))).toBe("urgent");
  });

  it("3 天后返回 warning", () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    expect(getExpiryStatus(formatDate(d))).toBe("warning");
  });

  it("10 天后返回 safe", () => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    expect(getExpiryStatus(formatDate(d))).toBe("safe");
  });
});

describe("daysUntilExpiry", () => {
  it("昨天返回 -1", () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(daysUntilExpiry(formatDate(d))).toBeLessThanOrEqual(0);
  });

  it("明天返回 1", () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    expect(daysUntilExpiry(formatDate(d))).toBe(1);
  });
});

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
