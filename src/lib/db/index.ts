import Dexie, { type EntityTable } from "dexie";
import type { FoodItem, ReceiptImport } from "@/lib/types";

const db = new Dexie("FridgeManagerDB") as Dexie & {
  foodItems: EntityTable<FoodItem, "id">;
  receipts: EntityTable<ReceiptImport, "id">;
};

db.version(1).stores({
  foodItems:
    "id, name, category, storageZone, status, expiryDate, purchaseDate, createdAt, updatedAt",
  receipts: "id, createdAt",
});

db.version(2).stores({
  foodItems:
    "id, name, category, storageZone, status, expiryDate, purchaseDate, createdAt, updatedAt, source, receiptId, matchedRuleKeyword",
  receipts: "id, createdAt",
});

// Ensure Dexie is only used client-side
if (typeof window !== "undefined") {
  db.open().catch((err) => {
    console.error("Failed to open IndexedDB:", err);
  });
}

export { db };
