"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useActiveItems } from "@/lib/hooks/use-food-items";
import { FoodCard } from "@/components/food/FoodCard";
import type { StorageZone, FoodCategory } from "@/lib/types";
import { FoodCategoryLabels, StorageZoneLabels } from "@/lib/types";
import { getExpiryStatus } from "@/lib/utils/shelf-life-calculator";
import Link from "next/link";

const zones: StorageZone[] = ["fridge", "freezer", "room"];
const categories: FoodCategory[] = [
  "vegetable", "fruit", "meat", "seafood", "dairy", "egg",
  "grain", "condiment", "beverage", "frozen", "snack", "leftover", "other",
];

function InventoryContent() {
  const searchParams = useSearchParams();
  const initialZone = searchParams.get("zone") as StorageZone | null;

  const items = useActiveItems();
  const [zoneFilter, setZoneFilter] = useState<StorageZone | "all">(
    initialZone ?? "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!items) return [];
    let result = [...items];

    if (zoneFilter !== "all") {
      result = result.filter((i) => i.storageZone === zoneFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((i) => getExpiryStatus(i.expiryDate) === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }

    return result;
  }, [items, zoneFilter, statusFilter, categoryFilter, search]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">全部库存</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="搜索食品..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
      />

      {/* Zone Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={zoneFilter === "all"}
          onClick={() => setZoneFilter("all")}
        >
          全部
        </FilterChip>
        {zones.map((z) => (
          <FilterChip
            key={z}
            active={zoneFilter === z}
            onClick={() => setZoneFilter(z)}
          >
            {StorageZoneLabels[z]}
          </FilterChip>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        >
          全部状态
        </FilterChip>
        <FilterChip
          active={statusFilter === "safe"}
          onClick={() => setStatusFilter("safe")}
        >
          正常
        </FilterChip>
        <FilterChip
          active={statusFilter === "warning"}
          onClick={() => setStatusFilter("warning")}
        >
          临期
        </FilterChip>
        <FilterChip
          active={statusFilter === "urgent"}
          onClick={() => setStatusFilter("urgent")}
        >
          紧急
        </FilterChip>
        <FilterChip
          active={statusFilter === "expired"}
          onClick={() => setStatusFilter("expired")}
        >
          已过期
        </FilterChip>
      </div>

      {/* Category Filter */}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value as FoodCategory | "all")}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
      >
        <option value="all">所有分类</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {FoodCategoryLabels[c]}
          </option>
        ))}
      </select>

      {/* Results */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500">没有找到匹配的食品</p>
          <Link
            href="/items/new"
            className="inline-block mt-3 text-primary text-sm"
          >
            去添加食品 →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-gray-400">加载中...</div>}>
      <InventoryContent />
    </Suspense>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
