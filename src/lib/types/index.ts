import { z } from "zod";

// === Enums / Literals ===

export const FoodCategory = z.enum([
  "vegetable",
  "fruit",
  "meat",
  "seafood",
  "dairy",
  "egg",
  "grain",
  "condiment",
  "beverage",
  "frozen",
  "snack",
  "leftover",
  "other",
]);
export type FoodCategory = z.infer<typeof FoodCategory>;

export const StorageZone = z.enum(["fridge", "freezer", "room"]);
export type StorageZone = z.infer<typeof StorageZone>;

export const ItemStatus = z.enum(["active", "eaten", "discarded"]);
export type ItemStatus = z.infer<typeof ItemStatus>;

// === Display Labels ===

export const FoodCategoryLabels: Record<FoodCategory, string> = {
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

export const StorageZoneLabels: Record<StorageZone, string> = {
  fridge: "冷藏",
  freezer: "冷冻",
  room: "常温",
};

export const ItemStatusLabels: Record<ItemStatus, string> = {
  active: "在库",
  eaten: "已吃完",
  discarded: "已丢弃",
};

// === Core Entities ===

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  storageZone: StorageZone;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  opened: boolean;
  note?: string;
  status: ItemStatus;
  expirySource: "auto" | "manual";
  createdAt: string;
  updatedAt: string;
  disposedAt?: string;
  referenceShelfLifeDays?: number;
  matchedRuleKeyword?: string;
  source?: "manual" | "receipt_mock" | "receipt_ocr";
  receiptId?: string;
}

// === Validation Schemas ===

export const FoodItemFormSchema = z.object({
  name: z.string().min(1, "请输入食品名称").max(100),
  category: FoodCategory,
  storageZone: StorageZone,
  quantity: z.coerce.number().positive("数量必须大于0").max(9999),
  unit: z.string().min(1, "请输入单位").max(20),
  purchaseDate: z.string().min(1, "请选择购买日期"),
  expiryDate: z.string().min(1, "请选择参考到期日期"),
  opened: z.boolean(),
  note: z.string().max(200).optional(),
  expirySource: z.enum(["auto", "manual"]),
});

export type FoodItemFormData = z.infer<typeof FoodItemFormSchema>;

// === Receipt Types ===

export interface ReceiptImport {
  id: string;
  imagePreview?: string;
  recognizedItems: ReceiptItem[];
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
  source: "mock" | "ocr";
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  category?: FoodCategory;
  storageZone?: StorageZone;
  expiryDate?: string;
  expirySource?: "auto" | "manual";
}

// === Rules Types ===

export interface ShelfLifeRule {
  keyword: string;
  category: FoodCategory;
  recommendedStorageLocation: StorageZone;
  shelfLifeByStorage: Partial<Record<StorageZone, number>>;
  openedAdjustment: number;
  referenceNote?: string;
}

export interface ClassificationResult {
  category: FoodCategory;
  storageZone: StorageZone;
  matched: boolean;
  matchedKeyword?: string;
}

export interface ShelfLifeResult {
  shelfLifeDays: number;
  expiryDate: string;
}
