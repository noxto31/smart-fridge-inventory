import type { ReceiptItem, ReceiptImport } from "@/lib/types";
import { classifyFood } from "./classification.service";
import { calculateShelfLife } from "@/lib/utils/shelf-life-calculator";
import { todayISO, nowISO } from "@/lib/utils/date-utils";
import { db } from "@/lib/db";

/**
 * 模拟 OCR 识别结果
 * 未来替换为真实 OCR API 调用
 */
export function mockRecognizeItems(): ReceiptItem[] {
  return [
    { name: "鲜牛奶", quantity: 1, unit: "盒" },
    { name: "鸡蛋", quantity: 1, unit: "盒" },
    { name: "西红柿", quantity: 2, unit: "个" },
    { name: "猪肉", quantity: 1, unit: "份" },
    { name: "面包", quantity: 1, unit: "袋" },
    { name: "酸奶", quantity: 6, unit: "杯" },
  ];
}

/**
 * 为识别结果补充自动分类和保质期信息
 */
export function enrichReceiptItems(items: ReceiptItem[]): ReceiptItem[] {
  return items.map((item) => {
    const classification = classifyFood(item.name);
    const shelfLife = calculateShelfLife(
      classification.category,
      classification.storageZone,
      false,
      todayISO()
    );

    return {
      ...item,
      category: item.category ?? classification.category,
      storageZone: item.storageZone ?? classification.storageZone,
      expiryDate: item.expiryDate ?? shelfLife.expiryDate,
      expirySource: item.expirySource ?? "auto",
    };
  });
}

/**
 * 保存小票导入记录
 */
export async function saveReceipt(
  items: ReceiptItem[],
  imagePreview?: string
): Promise<string> {
  const id = crypto.randomUUID();
  const receipt: ReceiptImport = {
    id,
    imagePreview,
    recognizedItems: items,
    createdAt: nowISO(),
    status: "confirmed",
    source: "mock",
  };
  await db.receipts.add(receipt);
  return id;
}
