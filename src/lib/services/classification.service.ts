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

  for (const rule of shelfLifeRules) {
    if (normalized.includes(rule.keyword.toLowerCase())) {
      return {
        category: rule.category,
        storageZone: rule.recommendedStorageLocation,
        matched: true,
        matchedKeyword: rule.keyword,
      };
    }
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
