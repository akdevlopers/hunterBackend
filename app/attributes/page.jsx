"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AttributeTable } from "@/components/attribute/AttributeTable";
import { AttributeModal } from "@/components/attribute/AttributeModal";
import { TermsModal } from "@/components/attribute/TermsModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function AttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [termsModalAttribute, setTermsModalAttribute] = useState(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadAttributes = async () => {
    setLoading(true);
    const res = await api.getAttributes({ page: 1, limit: 10 });
    const list = Array.isArray(res) ? res : (res?.data || []);
    setAttributes(list);
    setLoading(false);
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  const handleAddNew = () => {
    setEditingAttribute(null);
    setIsModalOpen(true);
  };

  const handleEdit = (attr) => {
    setEditingAttribute(attr);
    setIsModalOpen(true);
  };

  const handleConfigureTerms = (attr) => {
    setTermsModalAttribute(attr);
  };

  const handleSaveAttribute = async (formData) => {
    if (formData.id) {
      await api.updateAttribute(formData.id, formData);
      setToastMessage("Attribute updated successfully!");
    } else {
      await api.createAttribute(formData);
      setToastMessage("Attribute created successfully!");
    }
    loadAttributes();
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleAddTerm = async (attributeId, term) => {
    const updated = await api.addAttributeTerm(attributeId, term);
    setTermsModalAttribute(updated);
    loadAttributes();
  };

  const handleRemoveTerm = async (attributeId, term) => {
    const updated = await api.removeAttributeTerm(attributeId, term);
    setTermsModalAttribute(updated);
    loadAttributes();
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await api.deleteAttribute(deleteId);
      setDeleteId(null);
      setToastMessage("Attribute deleted successfully.");
      loadAttributes();
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header Bar matching Meetay Hunter */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Attributes</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Attributes</span>
            </div>
          </div>

          {/* Green Add Attribute Button */}
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Attribute</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Attributes Datatable */}
        <AttributeTable
          attributes={attributes}
          loading={loading}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onConfigureTerms={handleConfigureTerms}
          onRefresh={loadAttributes}
        />


        {/* Add / Edit Attribute Modal */}
        <AttributeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAttribute}
          attribute={editingAttribute}
        />

        {/* Configure Terms Modal */}
        <TermsModal
          isOpen={!!termsModalAttribute}
          onClose={() => setTermsModalAttribute(null)}
          attribute={termsModalAttribute}
          onAddTerm={handleAddTerm}
          onRemoveTerm={handleRemoveTerm}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Delete Attribute"
          description="Are you sure you want to delete this attribute? This action cannot be undone."
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Deleting this attribute will remove all associated variant options from your product customizers.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Yes, Delete Attribute
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
