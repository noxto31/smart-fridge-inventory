"use client";

import { useState } from "react";

export function DisclaimerBar() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("disclaimer-dismissed") === "true";
  });

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
      <p>
        保存期限为系统提供的参考建议，实际是否可食用请结合包装标识、保存条件及食品状态判断。
      </p>
      <button
        onClick={() => {
          localStorage.setItem("disclaimer-dismissed", "true");
          setDismissed(true);
        }}
        className="ml-2 text-amber-600 hover:text-amber-800 flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
