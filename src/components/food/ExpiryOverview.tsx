"use client";

import Link from "next/link";
import type { FoodItem } from "@/lib/types";
import { daysUntilExpiry } from "@/lib/utils/shelf-life-calculator";
import { relativeDateLabel } from "@/lib/utils/date-utils";

interface ExpiryOverviewProps {
  expired: FoodItem[];
  urgent: FoodItem[];
  warning: FoodItem[];
}

export function ExpiryOverview({ expired, urgent, warning }: ExpiryOverviewProps) {
  const total = expired.length + urgent.length + warning.length;

  if (total === 0) {
    return (
      <div className="bg-green-50 rounded-xl p-4 text-center">
        <p className="text-green-700 font-medium">所有食品状态良好</p>
        <p className="text-green-600 text-sm mt-1">暂无需要关注的临期食品</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expired.length > 0 && (
        <ExpirySection
          title="已超过参考期限"
          items={expired}
          bgColor="bg-red-50"
          textColor="text-red-700"
          countColor="text-red-600"
        />
      )}
      {urgent.length > 0 && (
        <ExpirySection
          title="未来 2 天内建议处理"
          items={urgent}
          bgColor="bg-orange-50"
          textColor="text-orange-700"
          countColor="text-orange-600"
        />
      )}
      {warning.length > 0 && (
        <ExpirySection
          title="未来 3-7 天内建议关注"
          items={warning}
          bgColor="bg-yellow-50"
          textColor="text-yellow-700"
          countColor="text-yellow-600"
        />
      )}
    </div>
  );
}

function ExpirySection({
  title,
  items,
  bgColor,
  textColor,
  countColor,
}: {
  title: string;
  items: FoodItem[];
  bgColor: string;
  textColor: string;
  countColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
        <span className={`text-xs font-medium ${countColor}`}>{items.length} 项</span>
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item) => {
          const days = daysUntilExpiry(item.expiryDate);
          return (
            <Link
              key={item.id}
              href={`/inventory/${item.id}`}
              className="flex items-center justify-between py-1"
            >
              <span className={`text-sm ${textColor}`}>{item.name}</span>
              <span className={`text-xs ${countColor}`}>
                {relativeDateLabel(days)}
              </span>
            </Link>
          );
        })}
        {items.length > 5 && (
          <p className={`text-xs ${countColor} text-center`}>
            还有 {items.length - 5} 项...
          </p>
        )}
      </div>
    </div>
  );
}
