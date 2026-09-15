"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryTable } from "@/components/category/CategoryTable";
import { CategoryModal } from "@/components/category/CategoryModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    const data = await api.getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await api.updateCategory(formData.id, formData);
        setToastMessage("Category successfully updated!");
      } else {
        await api.createCategory(formData);
        setToastMessage("Category successfully created!");
      }
      await loadCategories();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error("handleSave category error:", err);
      setToastMessage("Error saving category.");
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await api.deleteCategory(deleteId);
      setDeleteId(null);
      setToastMessage("Category deleted successfully.");
      loadCategories();
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleToggleStatus = async (id) => {
    const target = categories.find((c) => c.id === id);
    await api.toggleCategoryStatus(id, target);
    loadCategories();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header Bar matching Meetay Hunter style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Category</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Category</span>
            </div>
          </div>

          {/* Green Add Category Button */}
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Clean Category Datatable */}
        <CategoryTable
          categories={categories}
          loading={loading}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onToggleStatus={handleToggleStatus}
          onRefresh={loadCategories}
        />

        {/* Add / Edit Category Modal */}
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          category={editingCategory}
          categories={categories}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Deleting this category will remove it from storefront navigation. Any products assigned will need to be re-categorized.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Yes, Delete Category
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
