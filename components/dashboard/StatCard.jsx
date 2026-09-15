import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  percentage,
  icon: Icon,
  iconColor = "text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400",
  trend = "up",
  className,
}) {
  const isPositive = percentage ? percentage.includes("+") : true;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
              iconColor
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </h3>

        {percentage && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
              isPositive
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{percentage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
