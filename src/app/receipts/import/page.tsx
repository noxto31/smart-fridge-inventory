"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/receipt/ImageUploader";
import { RecognizedItemsList } from "@/components/receipt/RecognizedItemsList";
import { useToast } from "@/components/ui/Toast";
import {
  mockRecognizeItems,
  enrichReceiptItems,
  saveReceipt,
} from "@/lib/services/receipt.service";
import { createFoodItems } from "@/lib/services/food-item.service";
import type { ReceiptItem, FoodItemFormData } from "@/lib/types";
import { classifyFood } from "@/lib/services/classification.service";
import { calculateShelfLife } from "@/lib/utils/shelf-life-calculator";
import { todayISO } from "@/lib/utils/date-utils";

export default function ReceiptImportPage() {
  const router = useRouter();
  const { show } = useToast();
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelected = (_file: File, preview: string) => {
    setImagePreview(preview);
  };

  const handleMockRecognize = () => {
    const rawItems = mockRecognizeItems();
    const enriched = enrichReceiptItems(rawItems);
    setItems(enriched);
    setStep("review");
  };

  const handleItemChange = (index: number, item: ReceiptItem) => {
    const updated = [...items];
    updated[index] = item;
    setItems(updated);
  };

  const handleItemRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemAdd = () => {
    setItems([
      ...items,
      { name: "", quantity: 1, unit: "个" },
    ]);
  };

  const handleConfirmImport = async () => {
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      show("请至少添加一项食品", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData: FoodItemFormData[] = validItems.map((item) => {
        const classification = classifyFood(item.name);
        const shelfLife = calculateShelfLife(
          item.category ?? classification.category,
          item.storageZone ?? classification.storageZone,
          false,
          todayISO()
        );
        return {
          name: item.name,
          category: item.category ?? classification.category,
          storageZone: item.storageZone ?? classification.storageZone,
          quantity: item.quantity,
          unit: item.unit,
          purchaseDate: todayISO(),
          expiryDate: item.expiryDate ?? shelfLife.expiryDate,
          opened: false,
          expirySource: "auto" as const,
        };
      });

      await createFoodItems(formData);
      await saveReceipt(validItems, imagePreview);
      show(`已导入 ${validItems.length} 项食品`, "success");
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">导入小票</h1>

      {step === "upload" && (
        <>
          <ImageUploader onImageSelected={handleImageSelected} />

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">说明</p>
            <p>
              第一版暂未接入自动识别服务。当前可通过模拟识别结果体验确认录入流程。
            </p>
          </div>

          <button
            onClick={handleMockRecognize}
            className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            生成模拟识别结果
          </button>
        </>
      )}

      {step === "review" && (
        <>
          <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800">
            已识别 {items.length} 项商品，请检查并修改后确认导入
          </div>

          <RecognizedItemsList
            items={items}
            onItemChange={handleItemChange}
            onItemRemove={handleItemRemove}
            onItemAdd={handleItemAdd}
          />

          <div className="space-y-2">
            <button
              onClick={handleConfirmImport}
              disabled={submitting}
              className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "导入中..." : `确认导入 ${items.filter((i) => i.name.trim()).length} 项食品`}
            </button>
            <button
              onClick={() => {
                setStep("upload");
                setItems([]);
              }}
              className="w-full py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回重新选择
            </button>
          </div>
        </>
      )}
    </div>
  );
}
