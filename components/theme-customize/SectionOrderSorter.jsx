"use client";

import React from "react";
import { GripVertical, ArrowUp, ArrowDown, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SectionOrderSorter({ sections = [], onReorder, onSave, isSaving = false }) {
  const handleMove = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;
    const updated = [...sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onReorder(updated);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Page Section Ordering</h3>
          <p className="text-xs text-slate-500">Reorder layout components appearing from top to bottom</p>
        </div>
        <Button variant="primary" size="sm" loading={isSaving} onClick={onSave} icon={Check}>
          Save Order
        </Button>
      </div>

      {/* Reorderable list */}
      <div className="space-y-2">
        {sections.map((sectionKey, idx) => (
          <div
            key={sectionKey}
            className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-400 transition"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center">
                {idx + 1}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {sectionKey.replace(/_/g, " ")} Section
                </p>
                <p className="text-[10px] text-slate-400">Position #{idx + 1} on storefront layout</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(idx, "up")}
                disabled={idx === 0}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                title="Move section up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, "down")}
                disabled={idx === sections.length - 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition"
                title="Move section down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
