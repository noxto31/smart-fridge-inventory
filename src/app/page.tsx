"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ExpiryOverview } from "@/components/food/ExpiryOverview";
import { StorageZoneCard } from "@/components/food/StorageZoneCard";
import { FoodCard } from "@/components/food/FoodCard";
import type { FoodItem } from "@/lib/types";
import { todayISO, formatDateCN } from "@/lib/utils/date-utils";

export default function HomePage() {
  const activeItems = useLiveQuery(
    () => db.foodItems.where("status").equals("active").sortBy("expiryDate"),
    [],
    [] as FoodItem[]
  );

  const { expired, urgent, warning, zoneCounts, recentItems } = useMemo(() => {
    if (!activeItems || activeItems.length === 0) {
      return {
        expired: [] as FoodItem[],
        urgent: [] as FoodItem[],
        warning: [] as FoodItem[],
        zoneCounts: { fridge: 0, freezer: 0, room: 0 },
        recentItems: [] as FoodItem[],
      };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const exp: FoodItem[] = [];
    const urg: FoodItem[] = [];
    const warn: FoodItem[] = [];
    const counts = { fridge: 0, freezer: 0, room: 0 };

    for (const item of activeItems) {
      counts[item.storageZone]++;
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diff = Math.ceil(
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff < 0) exp.push(item);
      else if (diff <= 2) urg.push(item);
      else if (diff <= 7) warn.push(item);
    }

    return {
      expired: exp,
      urgent: urg,
      warning: warn,
      zoneCounts: counts,
      recentItems: activeItems.slice(0, 5),
    };
  }, [activeItems]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">家庭冰箱</h1>
        <p className="text-sm text-gray-500">{formatDateCN(todayISO())}</p>
      </div>

      {/* Expiry Overview */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 mb-3">临期提醒</h2>
        <ExpiryOverview expired={expired} urgent={urgent} warning={warning} />
      </section>

      {/* Storage Zones */}
      <section>
        <h2 className="text-sm font-medium text-gray-500 mb-3">存储区域</h2>
        <div className="grid grid-cols-3 gap-3">
          <StorageZoneCard zone="fridge" count={zoneCounts.fridge} />
          <StorageZoneCard zone="freezer" count={zoneCounts.freezer} />
          <StorageZoneCard zone="room" count={zoneCounts.room} />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/items/new"
            className="bg-primary text-white rounded-xl p-4 text-center hover:bg-primary-dark transition-colors"
          >
            <div className="text-2xl mb-1">➕</div>
            <div className="font-medium">添加食品</div>
          </Link>
          <Link
            href="/receipts/import"
            className="bg-white border-2 border-primary text-primary rounded-xl p-4 text-center hover:bg-primary-light transition-colors"
          >
            <div className="text-2xl mb-1">📷</div>
            <div className="font-medium">导入小票</div>
          </Link>
        </div>
      </section>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500">近期食品</h2>
            <Link href="/inventory" className="text-sm text-primary">
              查看全部 →
            </Link>
          </div>
          <div className="space-y-2">
            {recentItems.map((item) => (
              <FoodCard key={item.id} item={item} compact />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {activeItems && activeItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🧊</div>
          <p className="text-gray-500 mb-4">冰箱空空如也</p>
          <Link
            href="/items/new"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            添加第一个食品
          </Link>
        </div>
      )}
    </div>
  );
}
