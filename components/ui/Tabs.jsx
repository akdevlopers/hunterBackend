import React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, activeTab, onChange, className, size = "md" }) {
  const sizes = {
    sm: "text-xs py-1 px-2.5",
    md: "text-xs sm:text-sm py-1.5 px-3",
  };

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-800", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 font-medium transition-all duration-150 rounded-lg flex items-center justify-center gap-1.5",
              sizes[size],
              isActive
                ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
