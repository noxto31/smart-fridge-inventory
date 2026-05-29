import type { FoodCategory, StorageZone, ShelfLifeResult } from "@/lib/types";
import { shelfLifeRules, DEFAULT_SHELF_LIFE, CATEGORY_DEFAULT_SHELF_LIFE } from "@/lib/rules/shelf-life-rules";

/**
 * 计算参考保质期天数和到期日期
 *
 * @param category 食品分类
 * @param storageZone 存放位置
 * @param opened 是否已开封
 * @param purchaseDate 购买日期 (ISO date string, YYYY-MM-DD)
 * @param manualExpiryDate 用户手动指定的到期日期（优先使用）
 */
export function calculateShelfLife(
  category: FoodCategory,
  storageZone: StorageZone,
  opened: boolean,
  purchaseDate?: string,
  manualExpiryDate?: string,
  matchedKeyword?: string
): ShelfLifeResult {
  // 用户手动指定的日期优先
  if (manualExpiryDate) {
    const purchase = purchaseDate ? new Date(purchaseDate) : new Date();
    const expiry = new Date(manualExpiryDate);
    const days = Math.max(
      0,
      Math.ceil((expiry.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { shelfLifeDays: days, expiryDate: manualExpiryDate };
  }

  // 优先使用名称关键词匹配的特定规则（避免同分类不同食品共用错误保质期）
  // 无关键词时跳过具体规则查找，直接使用分类默认规则
  const keywordLower = matchedKeyword?.toLowerCase();
  const matchedRule = keywordLower
    ? shelfLifeRules.find(
        (r) => r.keyword.toLowerCase() === keywordLower
      )
    : null;

  let days: number;

  if (matchedRule) {
    const baseDays = matchedRule.shelfLifeByStorage[storageZone] ?? DEFAULT_SHELF_LIFE[storageZone] ?? 7;
    days = opened
      ? Math.max(1, Math.round(baseDays * matchedRule.openedAdjustment))
      : baseDays;
  } else {
    // 使用分类默认规则（不套用同分类中的具体食品保质期）
    const categoryDefaults = CATEGORY_DEFAULT_SHELF_LIFE[category];
    if (categoryDefaults) {
      const baseDays = categoryDefaults[storageZone] ?? DEFAULT_SHELF_LIFE[storageZone] ?? 7;
      // 分类默认规则使用通用的开封缩减比例
      const openedFactor = category === "leftover" || category === "snack" ? 1 : 0.5;
      days = opened
        ? Math.max(1, Math.round(baseDays * openedFactor))
        : baseDays;
    } else {
      // 完全兜底
      days = DEFAULT_SHELF_LIFE[storageZone] ?? 7;
      if (opened) {
        days = Math.max(1, Math.round(days * 0.5));
      }
    }
  }

  // 计算到期日期
  const baseDate = purchaseDate ? new Date(purchaseDate) : new Date();
  const expiryDate = new Date(baseDate);
  expiryDate.setDate(expiryDate.getDate() + days);

  return {
    shelfLifeDays: days,
    expiryDate: formatDateISO(expiryDate),
  };
}

/**
 * 获取过期状态
 * 返回 expired | urgent (0-2天) | warning (3-7天) | safe (7天以上)
 */
export function getExpiryStatus(
  expiryDate: string
): "expired" | "urgent" | "warning" | "safe" {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 2) return "urgent";
  if (diffDays <= 7) return "warning";
  return "safe";
}

/**
 * 计算剩余天数
 */
export function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
