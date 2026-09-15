"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Check, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function ProductModal({ isOpen, onClose, onSave, product = null, categories = [] }) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sku: "",
    price: "",
    sale_price: "",
    product_stock: "",
    cover_image_path: "",
    trending: false,
    status: false,
    description: "",
  });

  const [errors, setErrors] = useState({});
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category_id: (product.category_id || categories[0]?.id || "").toString(),
        sku: product.sku || "",
        price: product.price?.toString() || "",
        sale_price: product.sale_price?.toString() || "",
        product_stock: product.product_stock?.toString() || "0",
        cover_image_path: product.cover_image_path || product.cover_image_url || product.cover_image || product.image || "",
        trending: product.trending === 1 || product.trending === true,
        status: product.status === 1 || product.status === true,
        description: product.description || "",
      });
    } else {
      setFormData({
        name: "",
        category_id: categories[0]?.id?.toString() || "",
        sku: "",
        price: "",
        sale_price: "",
        product_stock: "",
        cover_image_path: "",
        trending: false,
        status: false,
        description: "",
      });
    }
    setErrors({});
  }, [product, isOpen, categories]);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        cover_image_path: previewUrl,
        cover_image_file: file,
        image_file: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.sale_price) newErrors.sale_price = "Sale price is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      id: product?.id,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Create New Product"}
      description="Fill in product details, category classification, inventory stock, and pricing."
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Product Name */}
        <Input
          label="Product Name *"
          placeholder="e.g. Silk Chiffon Evening Gown"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: "" });
          }}
          error={errors.name}
        />

        {/* Category & SKU Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Product Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent_id === 0 ? "📁 " : "↳ "}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="SKU Code"
            placeholder="e.g. STY-DRS-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>

        {/* Pricing & Stock Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Original Price (₹)"
            type="number"
            placeholder="Original price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />

          <Input
            label="Sale Price (₹) *"
            type="number"
            placeholder="Sale price"
            value={formData.sale_price}
            onChange={(e) => {
              setFormData({ ...formData, sale_price: e.target.value });
              setErrors({ ...errors, sale_price: "" });
            }}
            error={errors.sale_price}
          />

          <Input
            label="Stock Quantity"
            type="number"
            placeholder="0"
            value={formData.product_stock}
            onChange={(e) => setFormData({ ...formData, product_stock: e.target.value })}
          />
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Product Cover Image
          </label>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileChange}
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              {formData.cover_image_path ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                  <img
                    src={
                      formData.cover_image_path.startsWith("http://") ||
                      formData.cover_image_path.startsWith("https://") ||
                      formData.cover_image_path.startsWith("blob:") ||
                      formData.cover_image_path.startsWith("data:")
                        ? formData.cover_image_path
                        : `https://meetay.com/${formData.cover_image_path.replace(/^\/+/, "")}`
                    }
                    alt="Product Cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400"><svg class="w-5 h-5 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke-width="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="1.5"/></svg><span class="text-[9px] text-slate-400 mt-0.5">No image</span></div>';
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-[9px] text-slate-400 mt-0.5">No image</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File Here</span>
                </button>
                <p className="text-[10px] text-slate-400 mt-1">Recommended: 800x800px JPG/PNG/WebP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description Textarea */}
        <Textarea
          label="Product Description"
          placeholder="Detailed description, fabric composition, runway styling notes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        {/* Trending & Status Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Featured / Trending</p>
              <p className="text-[10px] text-slate-500">Showcase in Top Sales & Bestsellers</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, trending: !formData.trending })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.trending ? "bg-brand-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.trending ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Active Status</p>
              <p className="text-[10px] text-slate-500">Enable purchasing on storefront</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: !formData.status })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.status ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.status ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check}>
            {isEditing ? "Update Product" : "Save Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
