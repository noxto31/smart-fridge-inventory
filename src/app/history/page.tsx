"use client";

import { useState } from "react";
import { useHistoryItems } from "@/lib/hooks/use-food-items";
import { FoodCategoryLabels, StorageZoneLabels, type FoodItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDateCN } from "@/lib/utils/date-utils";

type StatusFilter = "all" | "eaten" | "discarded";

export default function HistoryPage() {
  const items = useHistoryItems();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered =
    filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">历史记录</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all" as const, label: "全部" },
          { key: "eaten" as const, label: "已吃完" },
          { key: "discarded" as const, label: "已丢弃" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              filter === tab.key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">暂无记录</p>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ item }: { item: FoodItem }) {
  return (
    <Link
      href={`/inventory/${item.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{item.name}</span>
            <Badge
              variant={item.status === "eaten" ? "safe" : item.status === "discarded" ? "warning" : "default"}
            >
              {item.status === "eaten" ? "已吃完" : "已丢弃"}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            {item.quantity} {item.unit} · {FoodCategoryLabels[item.category]} ·{" "}
            {StorageZoneLabels[item.storageZone]}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          {item.disposedAt && <p>处理于 {formatDateCN(item.disposedAt)}</p>}
          <p>购买于 {formatDateCN(item.purchaseDate)}</p>
        </div>
      </div>
    </Link>
  );
}
