import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "₹") {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency} 0.00`;
  }
  return `${currency} ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercentage(value) {
  if (value === undefined || value === null) return "0%";
  if (typeof value === "string") {
    if (value.startsWith("+") || value.startsWith("-")) return value + "%";
    const num = parseFloat(value);
    return isNaN(num) ? "0%" : `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
  }
  return `${value > 0 ? "+" : ""}${Number(value).toFixed(1)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

export function getOrderStatusBadge(status) {
  const map = {
    0: { label: "Pending", variant: "warning", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    1: { label: "Delivered", variant: "success", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
    2: { label: "Cancelled", variant: "danger", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
    3: { label: "Returned", variant: "danger", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" },
    4: { label: "Confirmed", variant: "info", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
    5: { label: "Picked Up", variant: "secondary", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
    6: { label: "Shipped", variant: "dark", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
    8: { label: "Pre Order", variant: "secondary", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  };

  return map[status] || { label: "Unknown", variant: "default", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
}
