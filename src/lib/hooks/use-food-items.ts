"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { FoodItem, StorageZone } from "@/lib/types";

export function useActiveItems() {
  return useLiveQuery(
    () =>
      db.foodItems.where("status").equals("active").sortBy("expiryDate"),
    [],
    [] as FoodItem[]
  );
}

export function useItemsByZone(zone: StorageZone) {
  return useLiveQuery(
    () =>
      db.foodItems
        .where("storageZone")
        .equals(zone)
        .and((item) => item.status === "active")
        .sortBy("expiryDate"),
    [zone],
    [] as FoodItem[]
  );
}

export function useFoodItem(id: string) {
  return useLiveQuery(
    () => db.foodItems.get(id),
    [id],
    undefined as FoodItem | undefined
  );
}

export function useHistoryItems() {
  return useLiveQuery(
    () =>
      db.foodItems
        .where("status")
        .anyOf(["eaten", "discarded"])
        .reverse()
        .sortBy("disposedAt"),
    [],
    [] as FoodItem[]
  );
}
