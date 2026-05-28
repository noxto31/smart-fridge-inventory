"use client";

import Link from "next/link";
import type { StorageZone } from "@/lib/types";
import { StorageZoneLabels } from "@/lib/types";

interface StorageZoneCardProps {
  zone: StorageZone;
  count: number;
}

const zoneStyles: Record<StorageZone, { icon: string; bg: string; border: string; text: string }> = {
  fridge: { icon: "❄️", bg: "bg-fridge-light", border: "border-fridge", text: "text-fridge" },
  freezer: { icon: "🧊", bg: "bg-frozen-light", border: "border-frozen", text: "text-frozen" },
  room: { icon: "🏠", bg: "bg-room-light", border: "border-room", text: "text-room" },
};

export function StorageZoneCard({ zone, count }: StorageZoneCardProps) {
  const style = zoneStyles[zone];

  return (
    <Link
      href={`/inventory?zone=${zone}`}
      className={`${style.bg} ${style.border} border-2 rounded-xl p-4 text-center hover:shadow-md transition-shadow`}
    >
      <div className="text-2xl mb-1">{style.icon}</div>
      <div className={`text-sm font-medium ${style.text}`}>{StorageZoneLabels[zone]}</div>
      <div className={`text-2xl font-bold ${style.text} mt-1`}>{count}</div>
      <div className="text-xs text-gray-500">项食品</div>
    </Link>
  );
}
