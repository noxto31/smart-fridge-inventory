"use client";

interface BadgeProps {
  variant?: "expired" | "urgent" | "warning" | "safe" | "default" | "fridge" | "freezer" | "room";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  expired: "bg-red-100 text-red-800",
  urgent: "bg-orange-100 text-orange-800",
  warning: "bg-yellow-100 text-yellow-800",
  safe: "bg-green-100 text-green-800",
  default: "bg-gray-100 text-gray-700",
  fridge: "bg-cyan-100 text-cyan-800",
  freezer: "bg-blue-100 text-blue-800",
  room: "bg-orange-100 text-orange-800",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
}
