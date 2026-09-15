"use client";

import React from "react";
import { Image as ImageIcon, Sparkles, Check, ChevronDown } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { RepeaterControl } from "./RepeaterControl";

export function DynamicFieldRenderer({ setting, value, onChange }) {
  const { type, label, key, placeholder, fields } = setting;

  switch (type) {
    case "switch":
      const isChecked = value === 1 || value === "1" || value === true;
      return (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>
            <p className="text-[11px] text-slate-500">Toggle this component visibility</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(isChecked ? 0 : 1)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isChecked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isChecked ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      );

    case "text":
    case "announce_title":
    case "meta_keywords":
    case "date":
      return (
        <Input
          label={label}
          placeholder={placeholder || `Enter ${label}...`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "textarea":
      return (
        <Textarea
          label={label}
          placeholder={placeholder || `Enter ${label}...`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <img
              src={value || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&auto=format&fit=crop&q=60"}
              alt={label}
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Image URL or relative path..."
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <p className="text-[10px] text-slate-400 mt-1">Recommended format: SVG, WebP, PNG or JPG</p>
            </div>
          </div>
        </div>
      );

    case "menu":
      return (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="Primary Header Nav">Primary Header Navigation</option>
            <option value="Footer Quick Links">Footer Quick Links</option>
            <option value="Category Mega Menu">Category Mega Menu</option>
          </select>
        </div>
      );

    case "select_category":
      return (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <select
            value={value ?? "all"}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="all">All Storefront Categories</option>
            <option value="dresses">Haute Couture Dresses</option>
            <option value="handbags">Luxury Leather Handbags</option>
            <option value="footwear">Designer Footwear</option>
          </select>
        </div>
      );

    case "slider":
    case "brand_carousel":
      let repeaterItems = [];
      if (Array.isArray(value)) {
        repeaterItems = value;
      } else if (typeof value === "string") {
        try {
          repeaterItems = JSON.parse(value);
        } catch (e) {
          repeaterItems = [];
        }
      }

      return (
        <RepeaterControl
          label={label}
          fields={fields || ["image", "big_text", "content", "button_text", "button_link"]}
          items={repeaterItems}
          onChange={(newItems) => onChange(newItems)}
        />
      );

    default:
      return (
        <Input
          label={label}
          placeholder={placeholder || `Enter ${label}...`}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
