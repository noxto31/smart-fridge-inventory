"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FoodItemFormSchema,
  type FoodItemFormData,
  type FoodCategory,
  type StorageZone,
  FoodCategoryLabels,
  StorageZoneLabels,
} from "@/lib/types";
import { getAutoFillDefaults } from "@/lib/services/food-item.service";
import { calculateShelfLife } from "@/lib/utils/shelf-life-calculator";
import { todayISO } from "@/lib/utils/date-utils";

const categories: FoodCategory[] = [
  "vegetable", "fruit", "meat", "seafood", "dairy", "egg",
  "grain", "condiment", "beverage", "frozen", "snack", "leftover", "other",
];

const zones: StorageZone[] = ["fridge", "freezer", "room"];

const units = ["个", "克", "千克", "袋", "盒", "瓶", "包", "份", "杯", "根", "条"];

interface FoodFormProps {
  initialData?: Partial<FoodItemFormData>;
  onSubmit: (data: FoodItemFormData) => Promise<void>;
  submitLabel?: string;
}

export function FoodForm({
  initialData,
  onSubmit,
  submitLabel = "添加到冰箱",
}: FoodFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameRef = useRef<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FoodItemFormData>({
    resolver: zodResolver(FoodItemFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category: initialData?.category ?? "other",
      storageZone: initialData?.storageZone ?? "fridge",
      quantity: initialData?.quantity ?? 1,
      unit: initialData?.unit ?? "个",
      purchaseDate: initialData?.purchaseDate ?? todayISO(),
      expiryDate: initialData?.expiryDate ?? "",
      opened: initialData?.opened ?? false,
      note: initialData?.note ?? "",
      expirySource: initialData?.expirySource ?? "auto",
    },
  });

  const watchedName = watch("name");
  const watchedZone = watch("storageZone");
  const watchedOpened = watch("opened");
  const watchedExpirySource = watch("expirySource");
  const watchedCategory = watch("category");
  const watchedPurchaseDate = watch("purchaseDate");

  // Auto-fill on name change (debounced)
  useEffect(() => {
    if (!watchedName || watchedName === nameRef.current) return;
    nameRef.current = watchedName;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const defaults = getAutoFillDefaults(watchedName);
      if (defaults.category !== "other") {
        setValue("category", defaults.category);
        setValue("storageZone", defaults.storageZone);
        setValue("expiryDate", defaults.expiryDate);
        setValue("expirySource", "auto");
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watchedName, setValue]);

  // Re-calculate shelf life when storage zone or opened status changes
  useEffect(() => {
    if (watchedExpirySource === "manual") return;
    if (!watchedCategory || watchedCategory === "other") return;

    const result = calculateShelfLife(
      watchedCategory,
      watchedZone,
      watchedOpened,
      watchedPurchaseDate || todayISO()
    );
    setValue("expiryDate", result.expiryDate);
  }, [watchedZone, watchedOpened, watchedCategory, watchedPurchaseDate, watchedExpirySource, setValue]);

  const onFormSubmit = async (data: FoodItemFormData) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* 食品名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">食品名称 *</label>
        <input
          {...register("name")}
          placeholder="输入食品名称，如：西红柿"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* 存放位置 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">存放位置 *</label>
        <div className="grid grid-cols-3 gap-2">
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => {
                setValue("storageZone", zone);
                if (watchedExpirySource !== "manual") {
                  setValue("expirySource", "auto");
                }
              }}
              className={`py-2.5 text-sm rounded-lg border-2 transition-colors ${
                watchedZone === zone
                  ? zone === "fridge"
                    ? "border-fridge bg-fridge-light text-fridge font-medium"
                    : zone === "freezer"
                    ? "border-frozen bg-frozen-light text-frozen font-medium"
                    : "border-room bg-room-light text-room font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {StorageZoneLabels[zone]}
            </button>
          ))}
        </div>
      </div>

      {/* 分类 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类
          <span className="text-gray-400 text-xs ml-1">（自动识别，可修改）</span>
        </label>
        <select
          {...register("category")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {FoodCategoryLabels[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* 数量与单位 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">数量 *</label>
          <input
            type="number"
            {...register("quantity")}
            min="0.1"
            step="0.1"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">单位 *</label>
          <select
            {...register("unit")}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 购买日期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">购买日期 *</label>
        <input
          type="date"
          {...register("purchaseDate")}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.purchaseDate && (
          <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>
        )}
      </div>

      {/* 参考到期日期 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          参考到期日期 *
          <span className="text-gray-400 text-xs ml-1">
            （{watchedExpirySource === "auto" ? "自动生成" : "手动设定"}，可修改）
          </span>
        </label>
        <input
          type="date"
          {...register("expiryDate")}
          onChange={(e) => {
            setValue("expiryDate", e.target.value);
            setValue("expirySource", "manual");
          }}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        {errors.expiryDate && (
          <p className="text-red-500 text-xs mt-1">{errors.expiryDate.message}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          保存期限为系统提供的参考建议，实际是否可食用请结合包装标识、保存条件及食品状态判断。
        </p>
      </div>

      {/* 是否开封 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="opened"
          {...register("opened")}
          onChange={(e) => {
            setValue("opened", e.target.checked);
            if (watchedExpirySource !== "manual") {
              setValue("expirySource", "auto");
            }
          }}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="opened" className="text-sm text-gray-700">
          已开封
        </label>
      </div>

      {/* 备注 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
        <textarea
          {...register("note")}
          rows={2}
          placeholder="可选，记录额外信息"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {submitting ? "提交中..." : submitLabel}
      </button>
    </form>
  );
}
