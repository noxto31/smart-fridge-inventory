import { db } from "@/lib/db";
import type {
  FoodItem,
  FoodItemFormData,
  ItemStatus,
  StorageZone,
  FoodCategory,
} from "@/lib/types";
import { nowISO } from "@/lib/utils/date-utils";
import { classifyFood } from "./classification.service";
import { calculateShelfLife } from "@/lib/utils/shelf-life-calculator";
import { todayISO } from "@/lib/utils/date-utils";

// === Create ===

export async function createFoodItem(data: FoodItemFormData): Promise<string> {
  const now = nowISO();
  const id = crypto.randomUUID();
  const classification = classifyFood(data.name);
  const shelfLife = calculateShelfLife(
    data.category,
    data.storageZone,
    data.opened,
    data.purchaseDate,
    data.expirySource === "manual" ? data.expiryDate : undefined,
    classification.matchedKeyword
  );
  const item: FoodItem = {
    id,
    ...data,
    status: "active",
    createdAt: now,
    updatedAt: now,
    referenceShelfLifeDays: shelfLife.shelfLifeDays,
    matchedRuleKeyword: classification.matchedKeyword,
    source: "manual",
  };
  await db.foodItems.add(item);
  return id;
}

export async function createFoodItems(
  items: FoodItemFormData[],
  meta?: { source?: "receipt_mock" | "receipt_ocr"; receiptId?: string }
): Promise<string[]> {
  const now = nowISO();
  const entries: FoodItem[] = items.map((data) => {
    const classification = classifyFood(data.name);
    const shelfLife = calculateShelfLife(
      data.category,
      data.storageZone,
      data.opened,
      data.purchaseDate,
      data.expirySource === "manual" ? data.expiryDate : undefined,
      classification.matchedKeyword
    );
    return {
      id: crypto.randomUUID(),
      ...data,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
      referenceShelfLifeDays: shelfLife.shelfLifeDays,
      matchedRuleKeyword: classification.matchedKeyword,
      source: meta?.source ?? "receipt_mock",
      receiptId: meta?.receiptId,
    };
  });
  await db.foodItems.bulkAdd(entries);
  return entries.map((e) => e.id);
}

// === Auto-fill ===

export function getAutoFillDefaults(name: string): {
  category: FoodCategory;
  storageZone: StorageZone;
  shelfLifeDays: number;
  expiryDate: string;
  expirySource: "auto";
} {
  const classification = classifyFood(name);
  const shelfLife = calculateShelfLife(
    classification.category,
    classification.storageZone,
    false,
    todayISO(),
    undefined,
    classification.matchedKeyword
  );
  return {
    category: classification.category,
    storageZone: classification.storageZone,
    shelfLifeDays: shelfLife.shelfLifeDays,
    expiryDate: shelfLife.expiryDate,
    expirySource: "auto",
  };
}

// === Read ===

export async function getFoodItem(id: string): Promise<FoodItem | undefined> {
  return db.foodItems.get(id);
}

export async function getAllActiveItems(): Promise<FoodItem[]> {
  return db.foodItems.where("status").equals("active").sortBy("expiryDate");
}

export async function getItemsByZone(zone: StorageZone): Promise<FoodItem[]> {
  return db.foodItems
    .where("storageZone")
    .equals(zone)
    .and((item) => item.status === "active")
    .sortBy("expiryDate");
}

// === Update ===

export async function updateFoodItem(
  id: string,
  data: Partial<FoodItemFormData>
): Promise<void> {
  await db.foodItems.update(id, {
    ...data,
    updatedAt: nowISO(),
  });
}

export async function markItemStatus(
  id: string,
  status: ItemStatus
): Promise<void> {
  await db.foodItems.update(id, {
    status,
    disposedAt: nowISO(),
    updatedAt: nowISO(),
  });
}

export async function markAsEaten(id: string): Promise<void> {
  return markItemStatus(id, "eaten");
}

export async function markAsDiscarded(id: string): Promise<void> {
  return markItemStatus(id, "discarded");
}

// === Delete ===

export async function deleteFoodItem(id: string): Promise<void> {
  await db.foodItems.delete(id);
}

// === Aggregate Queries ===

export interface ExpirySummary {
  expired: FoodItem[];
  urgent: FoodItem[];
  warning: FoodItem[];
}

export interface ZoneCounts {
  fridge: number;
  freezer: number;
  room: number;
}

export async function getExpirySummary(): Promise<ExpirySummary> {
  const active = await getAllActiveItems();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const expired: FoodItem[] = [];
  const urgent: FoodItem[] = [];
  const warning: FoodItem[] = [];

  for (const item of active) {
    const expiry = new Date(item.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) expired.push(item);
    else if (diffDays <= 2) urgent.push(item);
    else if (diffDays <= 7) warning.push(item);
  }

  return { expired, urgent, warning };
}

export async function getZoneCounts(): Promise<ZoneCounts> {
  const active = await db.foodItems
    .where("status")
    .equals("active")
    .toArray();

  return {
    fridge: active.filter((i) => i.storageZone === "fridge").length,
    freezer: active.filter((i) => i.storageZone === "freezer").length,
    room: active.filter((i) => i.storageZone === "room").length,
  };
}

// === History ===

export async function getHistoryItems(): Promise<FoodItem[]> {
  return db.foodItems
    .where("status")
    .anyOf(["eaten", "discarded"])
    .reverse()
    .sortBy("disposedAt");
}
