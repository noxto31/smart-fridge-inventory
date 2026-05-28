"use client";

import Link from "next/link";
import type { FoodItem } from "@/lib/types";
import { FoodCategoryLabels, StorageZoneLabels } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { getExpiryStatus, daysUntilExpiry } from "@/lib/utils/shelf-life-calculator";
import { relativeDateLabel } from "@/lib/utils/date-utils";

interface FoodCardProps {
  item: FoodItem;
  compact?: boolean;
}

export function FoodCard({ item, compact = false }: FoodCardProps) {
  const expiryStatus = getExpiryStatus(item.expiryDate);
  const days = daysUntilExpiry(item.expiryDate);

  return (
    <Link
      href={`/inventory/${item.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
            <Badge variant={item.storageZone as "fridge" | "freezer" | "room"}>
              {StorageZoneLabels[item.storageZone]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {item.quantity} {item.unit}
            </span>
            <span>·</span>
            <span>{FoodCategoryLabels[item.category]}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <Badge variant={expiryStatus}>
            {relativeDateLabel(days)}
          </Badge>
          {!compact && (
            <p className="text-xs text-gray-400 mt-1">
              {item.opened ? "已开封" : "未开封"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
