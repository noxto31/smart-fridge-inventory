import type { FoodCategory, StorageZone, ClassificationResult } from "@/lib/types";
import { shelfLifeRules } from "@/lib/rules/shelf-life-rules";

/**
 * 根据食品名称关键词自动判断分类和建议存放位置
 * 返回 matched=false 表示无法识别，使用默认值
 */
export function classifyFood(name: string): ClassificationResult {
  const normalized = name.trim().toLowerCase();

  if (!normalized) {
    return { category: "other", storageZone: "fridge", matched: false };
  }

  // 收集所有匹配规则，按关键词长度降序选择最具体的匹配。
  // 例如 "三文鱼"(3字) 优先于 "鱼"(1字)，"番茄酱"(3字) 优先于 "番茄"(2字)。
  // 长度相同时取数组中先出现的那条（规则库作者可通过排列控制同长度关键词的优先级）。
  let bestRule: (typeof shelfLifeRules)[number] | null = null;
  let bestLen = 0;

  for (const rule of shelfLifeRules) {
    const keywordLower = rule.keyword.toLowerCase();
    if (normalized.includes(keywordLower) && keywordLower.length > bestLen) {
      bestRule = rule;
      bestLen = keywordLower.length;
    }
  }

  if (bestRule) {
    return {
      category: bestRule.category,
      storageZone: bestRule.recommendedStorageLocation,
      matched: true,
      matchedKeyword: bestRule.keyword,
    };
  }

  return { category: "other", storageZone: "fridge", matched: false };
}

/**
 * 获取食品分类的显示名称
 */
export function getCategoryLabel(category: FoodCategory): string {
  const labels: Record<FoodCategory, string> = {
    vegetable: "蔬菜",
    fruit: "水果",
    meat: "肉类",
    seafood: "水产",
    dairy: "乳制品",
    egg: "蛋类",
    grain: "主食",
    condiment: "调味品",
    beverage: "饮料",
    frozen: "冷冻食品",
    snack: "零食",
    leftover: "熟食/剩菜",
    other: "其他",
  };
  return labels[category] || "其他";
}

/**
 * 获取存放位置的显示名称
 */
export function getStorageZoneLabel(zone: StorageZone): string {
  const labels: Record<StorageZone, string> = {
    fridge: "冷藏",
    freezer: "冷冻",
    room: "常温",
  };
  return labels[zone] || "冷藏";
}
