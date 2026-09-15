"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function RemarkModal({ isOpen, onClose, onSave, order = null }) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) {
      setNotes(order.remark_note || "");
    }
    setError("");
  }, [order, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Remark note is required when setting status to Remark.");
      return;
    }
    onSave(notes.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Remark Note"
      description={`Add an internal follow-up or operational note for Order #${order?.product_order_id || ""}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Remark Notes <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setError("");
            }}
            placeholder="e.g. Customer requested delivery after 6 PM, or awaiting customer size confirmation..."
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            required
          />
          {error && <p className="text-[11px] text-rose-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check}>
            Save Remark
          </Button>
        </div>
      </form>
    </Modal>
  );
}
