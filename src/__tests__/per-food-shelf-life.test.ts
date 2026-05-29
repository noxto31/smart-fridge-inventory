import { describe, it, expect } from "vitest";
import { classifyFood } from "@/lib/services/classification.service";
import { calculateShelfLife } from "@/lib/utils/shelf-life-calculator";

/**
 * 验证「按名称关键词匹配特定规则」后计算的保质天数正确。
 * 核心回归：同分类不同食品（如草莓 3 天 vs 苹果 21 天）不能共用同一个保质天数。
 */
describe("per-food shelf life via classifyFood + calculateShelfLife", () => {
  function getShelfLifeFor(name: string, purchaseDate = "2026-01-01") {
    const cls = classifyFood(name);
    const result = calculateShelfLife(
      cls.category,
      cls.storageZone,
      false,
      purchaseDate,
      undefined,
      cls.matchedKeyword
    );
    return result;
  }

  it("猪肉 — 冷藏 3 天", () => {
    const r = getShelfLifeFor("猪肉");
    expect(r.shelfLifeDays).toBe(3);
    expect(r.expiryDate).toBe("2026-01-04");
  });

  it("牛奶 — 冷藏 14 天", () => {
    const r = getShelfLifeFor("牛奶");
    expect(r.shelfLifeDays).toBe(14);
    expect(r.expiryDate).toBe("2026-01-15");
  });

  it("鸡蛋 — 冷藏 30 天", () => {
    const r = getShelfLifeFor("鸡蛋");
    expect(r.shelfLifeDays).toBe(30);
    expect(r.expiryDate).toBe("2026-01-31");
  });

  it("苹果 — 冷藏 21 天", () => {
    const r = getShelfLifeFor("苹果");
    expect(r.shelfLifeDays).toBe(21);
    expect(r.expiryDate).toBe("2026-01-22");
  });

  it("草莓 — 冷藏 3 天（不是 21 天）", () => {
    const r = getShelfLifeFor("草莓");
    expect(r.shelfLifeDays).toBe(3);
    expect(r.expiryDate).toBe("2026-01-04");
  });

  it("香蕉 — 常温 5 天", () => {
    const cls = classifyFood("香蕉");
    expect(cls.storageZone).toBe("room");
    const r = getShelfLifeFor("香蕉");
    expect(r.shelfLifeDays).toBe(5);
    expect(r.expiryDate).toBe("2026-01-06");
  });

  it("剩菜 — 冷藏 2 天", () => {
    const r = getShelfLifeFor("剩菜");
    expect(r.shelfLifeDays).toBe(2);
    expect(r.expiryDate).toBe("2026-01-03");
  });

  it("面包 — 常温 5 天", () => {
    const cls = classifyFood("面包");
    expect(cls.storageZone).toBe("room");
    const r = getShelfLifeFor("面包");
    expect(r.shelfLifeDays).toBe(5);
    expect(r.expiryDate).toBe("2026-01-06");
  });

  it("未识别食品 — 兜底 7 天", () => {
    const r = getShelfLifeFor("外星人食品");
    expect(r.shelfLifeDays).toBe(7);
    expect(r.expiryDate).toBe("2026-01-08");
  });

  it("草莓和苹果保质天数不同", () => {
    const strawberry = getShelfLifeFor("草莓");
    const apple = getShelfLifeFor("苹果");
    expect(strawberry.shelfLifeDays).not.toBe(apple.shelfLifeDays);
    expect(strawberry.shelfLifeDays).toBe(3);
    expect(apple.shelfLifeDays).toBe(21);
  });

  it("开封牛奶保质期缩短", () => {
    const cls = classifyFood("牛奶");
    const unopened = calculateShelfLife(
      cls.category, cls.storageZone, false, "2026-01-01", undefined, cls.matchedKeyword
    );
    const opened = calculateShelfLife(
      cls.category, cls.storageZone, true, "2026-01-01", undefined, cls.matchedKeyword
    );
    expect(opened.shelfLifeDays).toBeLessThan(unopened.shelfLifeDays);
    // 牛奶 openedAdjustment = 0.36, 14 * 0.36 ≈ 5
    expect(opened.shelfLifeDays).toBe(5);
  });

  it("手动指定日期优先于自动计算", () => {
    const cls = classifyFood("草莓");
    const r = calculateShelfLife(
      cls.category, cls.storageZone, false, "2026-01-01", "2026-06-01", cls.matchedKeyword
    );
    expect(r.expiryDate).toBe("2026-06-01");
    expect(r.shelfLifeDays).toBe(151);
  });

  it("classifyFood 返回 matchedKeyword", () => {
    const cls = classifyFood("草莓");
    expect(cls.matched).toBe(true);
    expect(cls.matchedKeyword).toBe("草莓");
  });

  it("未识别食品不返回 matchedKeyword", () => {
    const cls = classifyFood("外星人食品");
    expect(cls.matched).toBe(false);
    expect(cls.matchedKeyword).toBeUndefined();
  });

  // === V1.0.2 关键词优先级 → 保质期正确性 ===

  it("三文鱼使用三文鱼规则（冷藏 2 天），不使用普通鱼规则（冷藏 2 天）", () => {
    const cls = classifyFood("三文鱼");
    expect(cls.matchedKeyword).toBe("三文鱼");
    const r = getShelfLifeFor("三文鱼");
    // 三文鱼规则: fridge=2, 与鱼规则天数相同但规则来源不同
    expect(r.shelfLifeDays).toBe(2);
  });

  it("番茄酱使用调味品规则（冷藏 180 天），不使用番茄蔬菜规则（冷藏 7 天）", () => {
    const cls = classifyFood("番茄酱");
    expect(cls.matchedKeyword).toBe("番茄酱");
    expect(cls.category).toBe("condiment");
    const r = getShelfLifeFor("番茄酱");
    expect(r.shelfLifeDays).toBe(180);
  });

  // === V1.0.2 分类默认规则兜底（不套用具体食品规则） ===

  it("未识别水果手动指定分类时，不自动使用苹果规则", () => {
    // 直接调用 calculateShelfLife，不传 matchedKeyword，模拟"未识别但手动选了分类"
    const r = calculateShelfLife("fruit", "fridge", false, "2026-01-01");
    // 分类默认规则: fruit.fridge = 7，而非苹果的 21
    expect(r.shelfLifeDays).toBe(7);
  });

  it("未识别蔬菜手动指定分类时，不自动使用青菜规则", () => {
    const r = calculateShelfLife("vegetable", "fridge", false, "2026-01-01");
    // 分类默认规则: vegetable.fridge = 7，而非青菜的 5
    expect(r.shelfLifeDays).toBe(7);
  });

  it("完全未识别且分类为 other 时，走通用兜底 7 天", () => {
    const r = calculateShelfLife("other", "fridge", false, "2026-01-01");
    expect(r.shelfLifeDays).toBe(7);
  });

  it("未识别肉类手动指定分类时，走肉类默认冷藏 3 天", () => {
    const r = calculateShelfLife("meat", "fridge", false, "2026-01-01");
    // 分类默认规则: meat.fridge = 3
    expect(r.shelfLifeDays).toBe(3);
  });
});
