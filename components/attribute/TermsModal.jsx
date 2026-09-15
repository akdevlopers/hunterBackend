"use client";

import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Check, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function TermsModal({
  isOpen,
  onClose,
  attribute,
  onAddTerm,
  onRemoveTerm,
}) {
  const [newTerm, setNewTerm] = useState("");

  if (!attribute) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    onAddTerm(attribute.id, newTerm.trim());
    setNewTerm("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Terms: ${attribute.name}`}
      description={`Add and manage option values for "${attribute.name}" attribute.`}
    >
      <div className="space-y-4">
        {/* Add New Term Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Enter new option (e.g. ${attribute.name === "Size" ? "XXL" : "Navy"})...`}
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Term</span>
          </button>
        </form>

        {/* Existing Terms List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {(!attribute.terms || attribute.terms.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No terms configured yet. Add your first option term above.
            </div>
          ) : (
            attribute.terms.map((term, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab" />
                  <span className="text-xs font-medium text-slate-800">{term}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveTerm(attribute.id, term)}
                  className="p-1 rounded-md text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                  title="Delete option"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
