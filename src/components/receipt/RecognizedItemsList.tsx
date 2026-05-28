"use client";

import type { ReceiptItem } from "@/lib/types";
import { FoodCategoryLabels, StorageZoneLabels } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface RecognizedItemsListProps {
  items: ReceiptItem[];
  onItemChange: (index: number, item: ReceiptItem) => void;
  onItemRemove: (index: number) => void;
  onItemAdd: () => void;
}

export function RecognizedItemsList({
  items,
  onItemChange,
  onItemRemove,
  onItemAdd,
}: RecognizedItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无识别结果</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={item.name}
              onChange={(e) =>
                onItemChange(index, { ...item, name: e.target.value })
              }
              className="flex-1 text-sm font-medium px-2 py-1 border-b border-gray-200 focus:border-primary outline-none"
            />
            <button
              onClick={() => onItemRemove(index)}
              className="ml-2 text-gray-400 hover:text-red-500 p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                onItemChange(index, {
                  ...item,
                  quantity: Number(e.target.value),
                })
              }
              min="0.1"
              step="0.1"
              className="w-16 text-sm px-2 py-1 border border-gray-200 rounded focus:border-primary outline-none"
            />
            <input
              type="text"
              value={item.unit}
              onChange={(e) =>
                onItemChange(index, { ...item, unit: e.target.value })
              }
              className="w-12 text-sm px-2 py-1 border border-gray-200 rounded focus:border-primary outline-none"
            />
            {item.category && (
              <Badge variant="default">{FoodCategoryLabels[item.category]}</Badge>
            )}
            {item.storageZone && (
              <Badge variant={item.storageZone as "fridge" | "freezer" | "room"}>
                {StorageZoneLabels[item.storageZone]}
              </Badge>
            )}
          </div>
        </div>
      ))}

      <button
        onClick={onItemAdd}
        className="w-full py-2 text-sm text-primary border border-dashed border-primary rounded-lg hover:bg-primary-light transition-colors"
      >
        + 添加更多食品
      </button>
    </div>
  );
}
