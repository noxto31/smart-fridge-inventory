"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { FoodForm } from "@/components/food/FoodForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  updateFoodItem,
  markAsEaten,
  markAsDiscarded,
  deleteFoodItem,
} from "@/lib/services/food-item.service";
import { FoodCategoryLabels, StorageZoneLabels, type FoodItem, type FoodItemFormData } from "@/lib/types";
import { getExpiryStatus, daysUntilExpiry } from "@/lib/utils/shelf-life-calculator";
import { relativeDateLabel, formatDateCN } from "@/lib/utils/date-utils";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { show } = useToast();
  const id = params.id as string;

  const item = useLiveQuery(() => db.foodItems.get(id), [id], undefined as FoodItem | undefined);
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"eaten" | "discarded" | "delete" | null>(null);

  if (!item) {
    return (
      <div className="p-4 text-center text-gray-400">加载中...</div>
    );
  }

  const expiryStatus = getExpiryStatus(item.expiryDate);
  const days = daysUntilExpiry(item.expiryDate);

  const handleEdit = async (data: FoodItemFormData) => {
    await updateFoodItem(id, data);
    setEditing(false);
    show("食品信息已更新", "success");
  };

  const handleConfirmAction = async () => {
    if (confirmAction === "eaten") {
      await markAsEaten(id);
      show("已标记为吃完", "success");
    } else if (confirmAction === "discarded") {
      await markAsDiscarded(id);
      show("已标记为丢弃", "success");
    } else if (confirmAction === "delete") {
      await deleteFoodItem(id);
      show("已删除", "success");
    }
    setConfirmAction(null);
    router.push("/inventory");
  };

  if (editing) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">编辑食品</h1>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500"
          >
            取消
          </button>
        </div>
        <FoodForm
          initialData={{
            name: item.name,
            category: item.category,
            storageZone: item.storageZone,
            quantity: item.quantity,
            unit: item.unit,
            purchaseDate: item.purchaseDate,
            expiryDate: item.expiryDate,
            opened: item.opened,
            note: item.note,
            expirySource: item.expirySource,
          }}
          onSubmit={handleEdit}
          submitLabel="保存修改"
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-xl font-bold">{item.name}</h1>
          <Badge variant={expiryStatus}>{relativeDateLabel(days)}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={item.storageZone as "fridge" | "freezer" | "room"}>
            {StorageZoneLabels[item.storageZone]}
          </Badge>
          <Badge variant="default">{FoodCategoryLabels[item.category]}</Badge>
          {item.opened && <Badge variant="warning">已开封</Badge>}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <DetailRow label="数量" value={`${item.quantity} ${item.unit}`} />
        <DetailRow label="购买日期" value={formatDateCN(item.purchaseDate)} />
        <DetailRow
          label="参考到期日期"
          value={formatDateCN(item.expiryDate)}
          sub={item.expirySource === "auto" ? "自动生成" : "手动设定"}
        />
        <DetailRow label="开封状态" value={item.opened ? "已开封" : "未开封"} />
        {item.note && <DetailRow label="备注" value={item.note} />}
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          保存期限为系统提供的参考建议，实际是否可食用请结合包装标识、保存条件及食品状态判断。
        </p>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => setEditing(true)}
        className="w-full py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary-light transition-colors"
      >
        编辑信息
      </button>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setConfirmAction("eaten")}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          标记已吃完
        </button>
        <button
          onClick={() => setConfirmAction("discarded")}
          className="w-full py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
        >
          标记已丢弃
        </button>
        <button
          onClick={() => setConfirmAction("delete")}
          className="w-full py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          删除记录
        </button>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmAction === "eaten"}
        title="确认标记"
        message={`确定将「${item.name}」标记为已吃完吗？`}
        confirmLabel="确认"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "discarded"}
        title="确认标记"
        message={`确定将「${item.name}」标记为已丢弃吗？`}
        confirmLabel="确认"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "delete"}
        title="确认删除"
        message={`确定删除「${item.name}」的记录吗？此操作不可恢复。`}
        confirmLabel="删除"
        variant="danger"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium">{value}</span>
        {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
      </div>
    </div>
  );
}
