"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Move,
  GripVertical,
  Check,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export default function AttributeOptionPage() {
  const router = useRouter();
  const routeParams = useParams();
  const attributeId = routeParams?.id || "1";

  const [attribute, setAttribute] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState({ oldTerm: "", newTerm: "" });
  const [deleteTermName, setDeleteTermName] = useState(null);
  const [newTermInput, setNewTermInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = async (currentPage = page, currentLimit = pageSize) => {
    setLoading(true);
    // 1. Load attribute metadata
    const attr = await api.getAttributeById(attributeId);
    if (attr) {
      setAttribute(attr);
    } else {
      const attributes = await api.getAttributes({ page: 1, limit: 100 });
      const found = attributes.find(
        (a) => String(a.id) === String(attributeId)
      );
      if (found) setAttribute(found);
    }

    // 2. Load option list for this attribute
    const optionsRes = await api.getAttributeOptions(attributeId, { page: currentPage, limit: currentLimit });
    if (Array.isArray(optionsRes)) {
      setTerms(optionsRes);
      setTotalCount(optionsRes.length);
    } else {
      const list = optionsRes?.data || [];
      setTerms(list);
      setTotalCount(optionsRes?.total || list.length);
    }
    setLoading(false);
  };



  useEffect(() => {
    loadData();
  }, [attributeId]);

  // Drag and Drop Event Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...terms];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setTerms(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save reordered array to storage
    await api.reorderAttributeTerms(attributeId, updated);
    setToastMessage("Option terms order updated successfully!");
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Add Option
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTermInput.trim()) return;

    const val = newTermInput.trim();
    await api.addAttributeOption({
      attribute_id: attributeId,
      value: val,
    });

    setToastMessage("Attribute option created successfully!");
    setNewTermInput("");
    setIsAddModalOpen(false);
    loadData(page, pageSize);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Edit Option
  const handleEditOpen = (termObjOrName) => {
    const nameStr = typeof termObjOrName === "object" ? (termObjOrName.terms || termObjOrName.name || termObjOrName.value || "") : String(termObjOrName);
    setEditingTerm({ item: termObjOrName, oldTerm: nameStr, newTerm: nameStr });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTerm.newTerm.trim()) return;

    const optionId = typeof editingTerm.item === "object" ? editingTerm.item.id : editingTerm.oldTerm;
    await api.updateAttributeOption(optionId, { value: editingTerm.newTerm.trim() });

    setIsEditModalOpen(false);
    setToastMessage("Attribute option updated successfully!");
    loadData(page, pageSize);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Delete Option
  const handleDeleteConfirm = async () => {
    if (deleteTermName) {
      const optionId = typeof deleteTermName === "object" ? deleteTermName.id : deleteTermName;
      await api.deleteAttributeOption(optionId);
      setDeleteTermName(null);
      setToastMessage("Attribute option deleted successfully.");
      loadData(page, pageSize);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };


  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Top Header Bar matching Meetay attribute_option/index.blade.php */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Attribute-Option
              {attribute && <span className="text-emerald-700 font-normal text-base ml-2">({attribute.name})</span>}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/attributes" className="text-emerald-600 hover:underline">
                Attribute
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Attribute-options</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/attributes"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>

            {/* Green Add Option Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Attribute Option</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Centered Draggable List Card matching Meetay Layout */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Option Terms for &quot;{attribute?.name || "Attribute"}&quot;
                </h3>
                <p className="text-xs text-slate-500">
                  Drag and drop the items below to customize display sequence
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {terms.length} Options
              </span>
            </div>

            {/* Draggable List */}
            <div className="space-y-2.5 pt-1">
              {terms.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No options created for this attribute yet. Click &quot;Add Attribute Option&quot; above to create one.
                </div>
              ) : (
                terms.map((term, index) => {
                  const isDragging = draggedIndex === index;
                  const isOver = dragOverIndex === index;
                  const termText = typeof term === "object" ? (term.terms || term.name || term.value) : String(term);

                  return (
                    <div
                      key={typeof term === "object" && term.id ? term.id : index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-3.5 bg-white border rounded-xl transition-all cursor-grab active:cursor-grabbing select-none ${
                        isDragging
                          ? "opacity-40 border-dashed border-emerald-400 scale-[0.98]"
                          : isOver
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                          : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Left: Drag Handle & Title */}
                      <div className="flex items-center gap-3">
                        <div className="p-1 text-slate-400 hover:text-slate-700">
                          <Move className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{termText}</span>
                      </div>

                      {/* Right: Actions (Green Edit, Pink Delete) */}
                      {/* <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpen(termText);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer"
                          title="Edit Attribute Option"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTermName(termText);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer"
                          title="Delete Attribute Option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div> */}
                    </div>
                  );
                })

              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>
                  Showing {terms.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, totalCount || terms.length)} of {totalCount || terms.length} entries
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-[11px] text-slate-400">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      setPageSize(newLimit);
                      setPage(1);
                      loadData(1, newLimit);
                    }}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const prev = Math.max(1, page - 1);
                    setPage(prev);
                    loadData(prev, pageSize);
                  }}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer font-medium"
                >
                  Previous
                </button>

                {Array.from({ length: Math.ceil((totalCount || terms.length) / pageSize) || 1 }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setPage(pageNum);
                      loadData(pageNum, pageSize);
                    }}
                    className={`w-7 h-7 rounded-md text-xs font-semibold transition cursor-pointer ${
                      page === pageNum
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const maxP = Math.ceil((totalCount || terms.length) / pageSize) || 1;
                    const next = Math.min(maxP, page + 1);
                    setPage(next);
                    loadData(next, pageSize);
                  }}
                  disabled={page >= (Math.ceil((totalCount || terms.length) / pageSize) || 1)}
                  className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer font-medium"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Note text matching Meetay */}
            <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">
              <strong className="text-slate-800">Note : </strong>
              <span className="font-medium text-slate-700">
                You can easily change attribute option of attribute using drag & drop.
              </span>
            </p>
          </div>
        </div>


        {/* Add Attribute Option Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Attribute Option"
          description={`Add a new term value for "${attribute?.name || "Attribute"}".`}
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <Input
              label="Terms *"
              placeholder="e.g. XXL(Size 44)"
              value={newTermInput}
              onChange={(e) => setNewTermInput(e.target.value)}
              required
            />
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Check}>
                Create
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Attribute Option Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Attribute Option"
          description="Update this option value."
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Terms *"
              value={editingTerm.newTerm}
              onChange={(e) => setEditingTerm({ ...editingTerm, newTerm: e.target.value })}
              required
            />
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Check}>
                Update
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteTermName}
          onClose={() => setDeleteTermName(null)}
          title="Delete Option"
          description={`Are you sure you want to delete "${deleteTermName}"? This action cannot be undone.`}
        >
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteTermName(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Yes, Delete
            </Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
