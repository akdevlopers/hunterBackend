"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Check, X, Image as ImageIcon, Sparkles, Folder } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const getCategoryImageUrl = (cat) => {
  if (!cat) return "";
  const raw = cat.image_url || cat.image_path || cat.image || cat.cover_image_url || cat.cover_image_path;
  if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "undefined" || raw === "null") return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `https://meetay.com/${trimmed}`;
};

const getCategoryIconUrl = (cat) => {
  if (!cat) return "";
  const raw = cat.icon_path || cat.icon_image || cat.icon_url || cat.icon;
  if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "undefined" || raw === "null") return "";
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `https://meetay.com/${trimmed}`;
};

export function CategoryModal({ isOpen, onClose, onSave, category = null, categories = [] }) {
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: "",
    parent_id: "0",
    image_url: "",
    icon_path: "",
    trending: true,
    status: true,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [hasIconError, setHasIconError] = useState(false);
  const imageInputRef = useRef(null);
  const iconInputRef = useRef(null);

  useEffect(() => {
    setHasImageError(false);
    setHasIconError(false);
    if (category) {
      setFormData({
        name: category.name || "",
        parent_id: (category.parent_id || 0).toString(),
        image_url: getCategoryImageUrl(category),
        icon_path: getCategoryIconUrl(category),
        trending: category.trending === 1 || category.trending === true,
        status: category.status === 1 || category.status === true,
      });
    } else {
      setFormData({
        name: "",
        parent_id: "0",
        image_url: "",
        icon_path: "",
        trending: true,
        status: true,
      });
    }
    setError("");
  }, [category, isOpen]);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHasImageError(false);
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        image_url: previewUrl,
        image_file: file,
      }));
    }
  };

  const handleIconFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setHasIconError(false);
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        icon_path: previewUrl,
        icon_file: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        id: category?.id,
      });
      onClose();
    } catch (err) {
      console.error("Modal submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Add Category"}
      description="Configure category title, hierarchy, image upload, and storefront visibility."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <Input
          label="Category Title *"
          placeholder="e.g. Haute Couture Dresses"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setError("");
          }}
          error={error}
        />

        {/* Parent Category Hierarchy Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Parent Category
          </label>
          <select
            value={formData.parent_id}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="0">None (Primary Main Category)</option>
            {categories
              .filter((c) => !category || c.id !== category.id)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Assign a parent category to create a nested hierarchy or mega menu.
          </p>
        </div>

        {/* Image & Icon File Upload Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Main Cover Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Category Image
            </label>

            {/* Hidden File Input */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Upload Box with Preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-3">
                {formData.image_url && !hasImageError ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                    <img
                      src={formData.image_url}
                      alt="Category Cover"
                      onError={() => setHasImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-5 h-5 text-slate-400 stroke-[1.5]" />
                    <span className="text-[9px] text-slate-400 mt-0.5">No image</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File Here</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Icon Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Category Icon
            </label>

            {/* Hidden File Input */}
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIconFileChange}
            />

            {/* Upload Box with Preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-3">
                {formData.icon_path && !hasIconError ? (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 p-1">
                    <img
                      src={formData.icon_path}
                      alt="Category Icon"
                      onError={() => setHasIconError(true)}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-5 h-5 text-slate-400 stroke-[1.5]" />
                    <span className="text-[9px] text-slate-400 mt-0.5">No icon</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File Here</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">SVG, PNG, JPG icon file</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending & Status Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Trending Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Featured / Trending</p>
              <p className="text-[10px] text-slate-500">Showcase in top home carousel</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, trending: !formData.trending })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.trending ? "bg-brand-600" : "bg-slate-300"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.trending ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          {/* Status Switch */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Active Status</p>
              <p className="text-[10px] text-slate-500">Visible to customer storefront</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: !formData.status })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.status ? "bg-emerald-600" : "bg-slate-300"
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.status ? "translate-x-5" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check} loading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
