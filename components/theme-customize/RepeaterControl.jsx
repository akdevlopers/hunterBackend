"use client";

import React from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function RepeaterControl({ label, fields = [], items = [], onChange }) {
  const handleAddItem = () => {
    const newItem = {};
    fields.forEach((f) => {
      if (f === "image") newItem[f] = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80";
      else if (f === "big_text") newItem[f] = "New Showcase Slide";
      else if (f === "content") newItem[f] = "Describe your highlight offer or runway story here.";
      else if (f === "button_text") newItem[f] = "Shop Now";
      else if (f === "button_link") newItem[f] = "#";
      else newItem[f] = "";
    });
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleFieldChange = (index, fieldKey, val) => {
    const updated = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [fieldKey]: val };
      }
      return item;
    });
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;
    const updated = [...items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} ({items.length} {items.length === 1 ? "Item" : "Items"})
        </label>
        <Button variant="outline" size="xs" icon={Plus} onClick={handleAddItem}>
          Add Slide / Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">No repeater items yet. Click &quot;Add Slide / Item&quot; to begin.</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 relative group"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.big_text || item.brand_name || `Slide #${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === items.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Fields inside repeater */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {fields.map((fieldKey) => {
                  if (fieldKey === "image") {
                    return (
                      <div key={fieldKey} className="sm:col-span-2 space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Slide Image URL
                        </label>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100&auto=format&fit=crop&q=80"}
                            alt="Preview"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <input
                            type="text"
                            value={item.image || ""}
                            onChange={(e) => handleFieldChange(idx, "image", e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                          />
                        </div>
                      </div>
                    );
                  }

                  if (fieldKey === "content") {
                    return (
                      <div key={fieldKey} className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Slide Description
                        </label>
                        <textarea
                          rows={2}
                          value={item[fieldKey] || ""}
                          onChange={(e) => handleFieldChange(idx, fieldKey, e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={fieldKey}>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 capitalize">
                        {fieldKey.replace("_", " ")}
                      </label>
                      <input
                        type="text"
                        value={item[fieldKey] || ""}
                        onChange={(e) => handleFieldChange(idx, fieldKey, e.target.value)}
                        placeholder={`Enter ${fieldKey.replace("_", " ")}...`}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
