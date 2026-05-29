"use client";

import type { ReceiptItem, FoodCategory, StorageZone } from "@/lib/types";
import { FoodCategoryLabels, StorageZoneLabels } from "@/lib/types";

const categories: FoodCategory[] = [
  "vegetable", "fruit", "meat", "seafood", "dairy", "egg",
  "grain", "condiment", "beverage", "frozen", "snack", "leftover", "other",
];

const zones: StorageZone[] = ["fridge", "freezer", "room"];

interface RecognizedItemsListProps {
  items: ReceiptItem[];
  onItemChange: (index: number, item: ReceiptItem) => void;
  onItemRemove: (index: number) => void;
  onItemAdd: () => void;
  onNameBlur?: (index: number, name: string) => void;
}

export function RecognizedItemsList({
  items,
  onItemChange,
  onItemRemove,
  onItemAdd,
  onNameBlur,
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
          {/* 第一行：名称 + 删除 */}
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={item.name}
              onChange={(e) =>
                onItemChange(index, { ...item, name: e.target.value })
              }
              onBlur={(e) => onNameBlur?.(index, e.target.value)}
              placeholder="食品名称"
              className="flex-1 text-sm font-medium px-2 py-1 border-b border-gray-200 focus:border-primary outline-none"
            />
            <button
              onClick={() => onItemRemove(index)}
              className="ml-2 text-gray-400 hover:text-red-500 p-1"
            >
              ✕
            </button>
          </div>

          {/* 第二行：数量 + 单位 */}
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
          </div>

          {/* 第三行：分类 + 存放位置 */}
          <div className="flex items-center gap-2">
            <select
              value={item.category ?? "other"}
              onChange={(e) =>
                onItemChange(index, {
                  ...item,
                  category: e.target.value as FoodCategory,
                })
              }
              className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded bg-white focus:border-primary outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {FoodCategoryLabels[cat]}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              {zones.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() =>
                    onItemChange(index, { ...item, storageZone: zone })
                  }
                  className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                    item.storageZone === zone
                      ? zone === "fridge"
                        ? "border-fridge bg-fridge-light text-fridge font-medium"
                        : zone === "freezer"
                        ? "border-frozen bg-frozen-light text-frozen font-medium"
                        : "border-room bg-room-light text-room font-medium"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {StorageZoneLabels[zone]}
                </button>
              ))}
            </div>
          </div>

          {/* 第四行：到期日期 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 shrink-0">到期日</label>
            <input
              type="date"
              value={item.expiryDate ?? ""}
              onChange={(e) =>
                onItemChange(index, {
                  ...item,
                  expiryDate: e.target.value,
                  expirySource: e.target.value ? "manual" : "auto",
                })
              }
              className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded focus:border-primary outline-none"
            />
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
