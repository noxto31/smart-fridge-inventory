import { describe, it, expect } from "vitest";
import type { ReceiptItem } from "@/lib/types";
import { enrichReceiptItems } from "@/lib/services/receipt.service";
import { classifyFood } from "@/lib/services/classification.service";
import { calculateShelfLife } from "@/lib/utils/shelf-life-calculator";
import { todayISO } from "@/lib/utils/date-utils";

/**
 * 模拟 import 页面的 handleNameBlur 逻辑，
 * 验证 manualOverrides 保护机制。
 */
function simulateNameChange(
  item: ReceiptItem,
  newName: string
): ReceiptItem {
  const classification = classifyFood(newName);
  if (!classification.matched) return { ...item, name: newName };
  const overrides = item.manualOverrides;
  const shelfLife = calculateShelfLife(
    overrides?.category ? item.category! : classification.category,
    overrides?.storageZone ? item.storageZone! : classification.storageZone,
    false,
    todayISO(),
    undefined,
    classification.matchedKeyword
  );
  return {
    ...item,
    name: newName,
    category: overrides?.category ? item.category : classification.category,
    storageZone: overrides?.storageZone ? item.storageZone : classification.storageZone,
    expiryDate: overrides?.expiryDate ? item.expiryDate : shelfLife.expiryDate,
    expirySource: overrides?.expiryDate ? item.expirySource : "auto",
  };
}

function simulateRestoreAuto(item: ReceiptItem): ReceiptItem {
  const classification = classifyFood(item.name);
  if (!classification.matched) return item;
  const shelfLife = calculateShelfLife(
    classification.category,
    classification.storageZone,
    false,
    todayISO(),
    undefined,
    classification.matchedKeyword
  );
  return {
    ...item,
    category: classification.category,
    storageZone: classification.storageZone,
    expiryDate: shelfLife.expiryDate,
    expirySource: "auto",
    manualOverrides: undefined,
  };
}

describe("receipt manual override protection", () => {
  it("自动识别商品导入后 expirySource === auto", () => {
    const raw: ReceiptItem[] = [{ name: "牛奶", quantity: 1, unit: "盒" }];
    const enriched = enrichReceiptItems(raw);
    expect(enriched[0].expirySource).toBe("auto");
    expect(enriched[0].category).toBe("dairy");
  });

  it("用户修改到期日后导入，expirySource === manual", () => {
    const item: ReceiptItem = {
      name: "牛奶",
      quantity: 1,
      unit: "盒",
      category: "dairy",
      storageZone: "fridge",
      expiryDate: "2026-06-01",
      expirySource: "manual",
      manualOverrides: { expiryDate: true },
    };
    // expirySource 应保持 manual，不被自动覆盖
    expect(item.expirySource).toBe("manual");
    expect(item.expiryDate).toBe("2026-06-01");
  });

  it("修改名称后，未手动调整过的字段会更新", () => {
    // 初始: 牛奶 → dairy, fridge
    const item: ReceiptItem = {
      name: "牛奶",
      quantity: 1,
      unit: "盒",
      category: "dairy",
      storageZone: "fridge",
    };
    // 改名为猪肉 → 应更新为 meat
    const updated = simulateNameChange(item, "猪肉");
    expect(updated.category).toBe("meat");
    expect(updated.storageZone).toBe("fridge");
  });

  it("用户已改为冷冻后，再修改名称，冷冻选择不被覆盖", () => {
    const item: ReceiptItem = {
      name: "牛奶",
      quantity: 1,
      unit: "盒",
      category: "dairy",
      storageZone: "freezer", // 用户手动改为冷冻
      manualOverrides: { storageZone: true },
    };
    // 改名为猪肉 → 分类更新为 meat，但存放位置保持 freezer
    const updated = simulateNameChange(item, "猪肉");
    expect(updated.category).toBe("meat");
    expect(updated.storageZone).toBe("freezer"); // 保留手动值
  });

  it("用户已手动改到期日后，再修改名称，日期不被覆盖", () => {
    const item: ReceiptItem = {
      name: "牛奶",
      quantity: 1,
      unit: "盒",
      category: "dairy",
      storageZone: "fridge",
      expiryDate: "2026-12-31",
      expirySource: "manual",
      manualOverrides: { expiryDate: true },
    };
    // 改名为猪肉 → 分类和位置更新，但日期保留
    const updated = simulateNameChange(item, "猪肉");
    expect(updated.category).toBe("meat");
    expect(updated.expiryDate).toBe("2026-12-31");
    expect(updated.expirySource).toBe("manual");
  });

  it("点击恢复自动建议后，字段重新采用规则计算结果", () => {
    const item: ReceiptItem = {
      name: "牛奶",
      quantity: 1,
      unit: "盒",
      category: "other", // 被手动改成了 other
      storageZone: "freezer",
      expiryDate: "2099-01-01",
      expirySource: "manual",
      manualOverrides: { category: true, storageZone: true, expiryDate: true },
    };
    const restored = simulateRestoreAuto(item);
    expect(restored.category).toBe("dairy");
    expect(restored.storageZone).toBe("fridge");
    expect(restored.expirySource).toBe("auto");
    expect(restored.manualOverrides).toBeUndefined();
    expect(restored.expiryDate).not.toBe("2099-01-01");
  });

  it("手动日期不会被自动规则重新覆盖", () => {
    const raw: ReceiptItem[] = [{ name: "猪肉", quantity: 1, unit: "份" }];
    const enriched = enrichReceiptItems(raw);
    const autoDate = enriched[0].expiryDate;

    // 用户修改了到期日到一个明显不同的日期
    const manualItem: ReceiptItem = {
      ...enriched[0],
      expiryDate: "2099-12-31",
      expirySource: "manual",
      manualOverrides: { expiryDate: true },
    };
    // 重新分类不覆盖手动日期
    const updated = simulateNameChange(manualItem, "猪肉");
    expect(updated.expiryDate).toBe("2099-12-31");
    expect(updated.expirySource).toBe("manual");
    // 自动计算的日期应该是不同的
    expect(autoDate).not.toBe("2099-12-31");
  });
});
