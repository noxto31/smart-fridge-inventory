"use client";

import { useRouter } from "next/navigation";
import { FoodForm } from "@/components/food/FoodForm";
import { createFoodItem } from "@/lib/services/food-item.service";
import { useToast } from "@/components/ui/Toast";
import type { FoodItemFormData } from "@/lib/types";

export default function NewItemPage() {
  const router = useRouter();
  const { show } = useToast();

  const handleSubmit = async (data: FoodItemFormData) => {
    await createFoodItem(data);
    show("食品已添加", "success");
    router.push("/");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">添加食品</h1>
      <FoodForm onSubmit={handleSubmit} submitLabel="添加到冰箱" />
    </div>
  );
}
