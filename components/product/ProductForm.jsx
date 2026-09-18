"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Layers,
  ArrowLeft,
  Check,
  Lock,
  AlertCircle,
  Image as ImageIcon,
  Images,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { api } from "@/lib/api";


function extractProductAttributes(data, allAttrs = []) {
  if (!data) return [];
  const foundIds = [];

  // 1. From product_attribute (JSON string, array, or object)
  if (data.product_attribute) {
    let parsed = data.product_attribute;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        parsed = [];
      }
    }
    if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        if (item && item.attribute_id !== undefined && item.attribute_id !== null) {
          foundIds.push(String(item.attribute_id));
        } else if (item && item.id !== undefined && item.id !== null) {
          foundIds.push(String(item.id));
        }
      });
    } else if (parsed && typeof parsed === "object") {
      if (parsed.attribute_id !== undefined && parsed.attribute_id !== null) {
        foundIds.push(String(parsed.attribute_id));
      } else if (parsed.id !== undefined && parsed.id !== null) {
        foundIds.push(String(parsed.id));
      }
    }
  }

  // 2. From attribute_id
  if (data.attribute_id !== undefined && data.attribute_id !== null) {
    if (Array.isArray(data.attribute_id)) {
      data.attribute_id.forEach((id) => foundIds.push(String(id)));
    } else {
      const parts = String(data.attribute_id).split(/[,|]/).map((s) => s.trim()).filter(Boolean);
      foundIds.push(...parts);
    }
  }

  const uniqueIds = Array.from(new Set(foundIds));
  return uniqueIds.map((id) => {
    const matched = (allAttrs || []).find((a) => String(a.id) === String(id));
    return {
      id: matched ? matched.id : id,
      name: matched ? matched.name : `Attribute ${id}`,
    };
  });
}

export function ProductForm({
  initialData = null,
  productId = null,
  categories = [],
  onSave,
  isEditing = false,
}) {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    weight: "",
    purchase_price: "",
    sale_price: "",
    new_arrival: false,
    display_product: false,
    cover_image_path: "",
    // Attributes & Variants
    selected_attribute: "",
    visible_on_product_page: true,
    used_for_variations: true,
    attribute_options: [],
    variants: [],
    // About Product Rich Text
    description: "",
    specification: "",
    detail: "",
  });

  const [showPurchasePrice, setShowPurchasePrice] = useState(!isEditing);
  const [isPurchasePriceUnlocked, setIsPurchasePriceUnlocked] = useState(!isEditing);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyPasswordInput, setVerifyPasswordInput] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [newOptionInput, setNewOptionInput] = useState("");
  const [saving, setSaving] = useState(false);
  const coverImageInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const attrDropdownRef = useRef(null);
  const optionsDropdownRef = useRef(null);

  const [allAttributes, setAllAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [isAttrDropdownOpen, setIsAttrDropdownOpen] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [imgError, setImgError] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);

  // Multiple Gallery Images State
  const [galleryImages, setGalleryImages] = useState([]);
  const [deletedGalleryImageIds, setDeletedGalleryImageIds] = useState([]);

  const [groupedAttributeOptions, setGroupedAttributeOptions] = useState([]);
  const [availableAttributeOptions, setAvailableAttributeOptions] = useState([]);
  const [isOptionsDropdownOpen, setIsOptionsDropdownOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Fetch all available attributes
  useEffect(() => {
    async function loadAttributes() {
      const attrs = await api.getAllProductAttributes();
      const list = Array.isArray(attrs) ? attrs : (attrs?.data || []);
      setAllAttributes(list);

      if (initialData) {
        const extracted = extractProductAttributes(initialData, list);
        if (extracted.length > 0) {
          setSelectedAttributes(extracted);
        }
      }
    }
    loadAttributes();
  }, [initialData]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (attrDropdownRef.current && !attrDropdownRef.current.contains(event.target)) {
        setIsAttrDropdownOpen(false);
      }
      if (optionsDropdownRef.current && !optionsDropdownRef.current.contains(event.target)) {
        setIsOptionsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      const initVariants = (initialData.variants || []).map((v) => ({
        id: v.variant || v.sku || String(v.id),
        name: v.variant || v.sku || "Option",
        stock: (v.stock ?? 1).toString(),
        sku: v.sku || "",
        price: v.price || v.variation_price || "",
        isOpen: true,
      }));

      const initOptions = initVariants.map((v) => v.name);

      let isForVariation = true;
      let isVisibleOnPage = true;
      if (initialData.product_attribute) {
        let parsed = initialData.product_attribute;
        if (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) { }
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          const attrId = first.attribute_id || first.id;
          if (first[`for_variation_${attrId}`] !== undefined) {
            isForVariation = String(first[`for_variation_${attrId}`]) === "1" || first[`for_variation_${attrId}`] === true;
          }
          if (first[`visible_attribute_${attrId}`] !== undefined) {
            isVisibleOnPage = String(first[`visible_attribute_${attrId}`]) === "1" || first[`visible_attribute_${attrId}`] === true;
          }
        }
      } else if (initialData.variant_product !== undefined && initialData.variant_product !== null) {
        isForVariation = initialData.variant_product === 1 || initialData.variant_product === "1" || initialData.variant_product === true;
      }

      setFormData((prev) => ({
        ...prev,
        name: initialData.name || "",
        category_id: (initialData.category_id || categories[0]?.id || "").toString(),
        weight: initialData.product_weight || initialData.weight || "",
        purchase_price: isEditing
          ? (prev.purchase_price || "")
          : (initialData.purchase_price?.toString() || ""),
        sale_price: initialData.sale_price?.toString() || initialData.price?.toString() || "",
        new_arrival: initialData.trending === 1 || initialData.trending === true,
        display_product: initialData.status === 1 || initialData.status === true,
        cover_image_path: initialData.cover_image_url || initialData.cover_image_path || initialData.cover_image || initialData.image || "",
        description: initialData.description || "",
        specification: initialData.specification || "",
        detail: initialData.detail || "",
        visible_on_product_page: isVisibleOnPage,
        used_for_variations: isForVariation,
        attribute_options: initOptions,
        variants: initVariants,
      }));

      const rawImg = initialData.cover_image_url || initialData.cover_image_path || initialData.cover_image || initialData.image || "";
      if (rawImg) {
        if (rawImg.startsWith("http://") || rawImg.startsWith("https://") || rawImg.startsWith("blob:") || rawImg.startsWith("data:")) {
          setImagePreview(rawImg);
        } else {
          setImagePreview(`https://meetay.com/${rawImg.replace(/^\/+/, "")}`);
        }
        setImgError(false);
      } else {
        setImagePreview("");
      }

      const rawCoverImg = (initialData.cover_image_url || initialData.cover_image_path || initialData.cover_image || initialData.image || "").trim();
      const cleanCoverPath = rawCoverImg.split("?")[0].replace(/^https?:\/\/[^\/]+\//, "").replace(/^\/+/, "");
      const cleanCoverBaseName = decodeURIComponent((cleanCoverPath.split("/").pop() || "").replace(/^(\d+_)+/, ""));

      // Initialize gallery images with deduplication and exclude cover image
      const rawGallery = [
        ...(Array.isArray(initialData.product_images) ? initialData.product_images : []),
        ...(Array.isArray(initialData.images) ? initialData.images : []),
      ];

      if (rawGallery.length > 0) {
        const formattedGallery = [];

        rawGallery.forEach((img, idx) => {
          const imgId = typeof img === "object" && (img.id || img.image_id) ? String(img.id || img.image_id) : null;
          let url = typeof img === "string" ? img : (img.image_url || img.image_path || img.url || "");
          if (url && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("blob:") && !url.startsWith("data:")) {
            url = `https://meetay.s3.ap-south-1.amazonaws.com/${url.replace(/^\/+/, "")}`;
          }

          if (!url) return;

          const cleanUrl = url.split("?")[0];
          const cleanImgPath = cleanUrl.replace(/^https?:\/\/[^\/]+\//, "").replace(/^\/+/, "");
          const rawFileName = cleanUrl.split("/").pop() || "";
          // Strip timestamp prefixes like "1789560063697_491_" to get original filename
          const baseName = decodeURIComponent(rawFileName.replace(/^(\d+_)+/, ""));
          const matchKey = baseName || cleanUrl;

          // 1. Exclude Cover Image from Gallery Images
          if (
            (cleanCoverPath && cleanImgPath && cleanCoverPath === cleanImgPath) ||
            (cleanCoverBaseName && baseName && cleanCoverBaseName === baseName)
          ) {
            return;
          }

          // 2. Check if this image was already added to formattedGallery (group all duplicate IDs together)
          const existingEntry = formattedGallery.find((item) => item.matchKey === matchKey);
          if (existingEntry) {
            if (imgId && !existingEntry.allIds.includes(imgId)) {
              existingEntry.allIds.push(imgId);
            }
            return;
          }

          formattedGallery.push({
            id: imgId || `existing-${idx}`,
            allIds: imgId ? [imgId] : [],
            matchKey: matchKey,
            url: url,
            isExisting: true,
            raw: img,
          });
        });

        setGalleryImages(formattedGallery);
      } else {
        setGalleryImages([]);
      }

      const hasProductAttrValues = (() => {
        if (!initialData.product_attribute) return false;
        try {
          const parsed = typeof initialData.product_attribute === "string" ? JSON.parse(initialData.product_attribute) : initialData.product_attribute;
          return Array.isArray(parsed) && parsed.some((p) => Array.isArray(p.values) && p.values.length > 0);
        } catch (e) {
          return false;
        }
      })();

      if (!hasProductAttrValues) {
        setSelectedOptions(initOptions);
      }

      const extractedAttrs = extractProductAttributes(initialData, allAttributes);
      if (extractedAttrs.length > 0) {
        setSelectedAttributes(extractedAttrs);
      }
    }
  }, [initialData, categories, isEditing, allAttributes]);

  const handlePurchasePriceEyeClick = () => {
    if (isEditing && !isPurchasePriceUnlocked) {
      setShowPasswordModal(true);
      setVerifyError("");
      setVerifyPasswordInput("");
    } else {
      setShowPurchasePrice((prev) => !prev);
    }
  };

  const handleVerifyPurchasePrice = async (e) => {
    if (e) e.preventDefault();
    if (!verifyPasswordInput.trim()) {
      setVerifyError("Please enter your password.");
      return;
    }

    setVerifyLoading(true);
    setVerifyError("");

    try {
      const targetId = String(productId || initialData?.id || "");
      const res = await api.verifyPurchasePricePassword({
        password: verifyPasswordInput,
        type: "purchase_price",
        product_id: targetId,
      });

      if (res && (res.success || res.status === "success")) {
        const verifiedPrice =
          res.purchase_price !== undefined && res.purchase_price !== null
            ? res.purchase_price
            : (res.product?.purchase_price ?? "");

        setFormData((prev) => ({
          ...prev,
          purchase_price: String(verifiedPrice),
        }));
        setIsPurchasePriceUnlocked(true);
        setShowPurchasePrice(true);
        setShowPasswordModal(false);
        setVerifyPasswordInput("");
      } else {
        setVerifyError(res?.message || res?.error || "Incorrect password. Verification failed.");
      }
    } catch (err) {
      setVerifyError(err.message || "Failed to verify password. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // Load options for all selected attributes
  useEffect(() => {
    if (selectedAttributes.length > 0) {
      async function loadOptions() {
        const results = await Promise.all(
          selectedAttributes.map(async (attr) => {
            try {
              const res = await api.getAttributeOptionsAll(attr.id);
              const list = Array.isArray(res) ? res : (res?.data || []);
              return {
                attributeId: attr.id,
                attributeName: attr.name,
                options: list,
              };
            } catch (e) {
              return {
                attributeId: attr.id,
                attributeName: attr.name,
                options: [],
              };
            }
          })
        );
        setGroupedAttributeOptions(results);

        const flat = [];
        results.forEach((grp) => {
          grp.options.forEach((opt) => {
            const termText = typeof opt === "object" ? (opt.terms || opt.name || opt.value) : String(opt);
            if (termText) {
              flat.push({
                id: String(opt.id || `${grp.attributeId}-${termText}`),
                termText,
                attributeId: grp.attributeId,
                attributeName: grp.attributeName,
              });
            }
          });
        });
        setAvailableAttributeOptions(flat);
      }
      loadOptions();
    } else {
      setGroupedAttributeOptions([]);
      setAvailableAttributeOptions([]);
    }
  }, [selectedAttributes]);

  // If initialData contains option IDs in product_attribute.values (e.g., ["15|16|18"]), resolve them to term texts by ID only
  useEffect(() => {
    if (availableAttributeOptions.length > 0 && initialData?.product_attribute) {
      let parsed = initialData.product_attribute;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          parsed = [];
        }
      }
      if (Array.isArray(parsed)) {
        const rawValues = [];
        parsed.forEach((p) => {
          if (Array.isArray(p.values)) {
            p.values.forEach((v) => {
              String(v).split(/[,|]/).forEach((val) => {
                const trimmed = val.trim();
                if (trimmed) rawValues.push(trimmed);
              });
            });
          }
        });

        const matchedTerms = [];
        rawValues.forEach((val) => {
          // ID only check
          const matchedOpt = availableAttributeOptions.find(
            (opt) => String(opt.id) === String(val)
          );
          if (matchedOpt && !matchedTerms.includes(matchedOpt.termText)) {
            matchedTerms.push(matchedOpt.termText);
          }
        });

        if (matchedTerms.length > 0) {
          setSelectedOptions(matchedTerms);
          setFormData((prev) => {
            const existingVariants = prev.variants || [];
            const newVariants = matchedTerms.map((term) => {
              const found = existingVariants.find(
                (v) => (v.name || v.variant) === term || String(v.id) === String(term)
              );
              if (found) {
                return {
                  ...found,
                  name: term,
                };
              }
              return {
                id: term,
                name: term,
                stock: "1",
                sku: "",
                price: "",
                isOpen: true,
              };
            });
            return {
              ...prev,
              attribute_options: matchedTerms,
              variants: newVariants,
            };
          });
        }
      }
    }
  }, [availableAttributeOptions, initialData]);

  const handleToggleAttribute = (attr) => {
    const exists = selectedAttributes.some((a) => String(a.id) === String(attr.id));
    if (exists) {
      setSelectedAttributes((prev) => prev.filter((a) => String(a.id) !== String(attr.id)));
    } else {
      setSelectedAttributes((prev) => [...prev, attr]);
    }
  };

  const handleRemoveAttribute = (attrId) => {
    setSelectedAttributes((prev) => prev.filter((a) => String(a.id) !== String(attrId)));
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setImgError(false);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({
        ...prev,
        cover_image_file: file,
        cover_image: file,
        image_file: file,
        file: file,
      }));
    }
  };

  const handleRemoveCoverImage = () => {
    setSelectedCoverFile(null);
    setImagePreview("");
    setImgError(false);
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
    setFormData((prev) => ({
      ...prev,
      cover_image_file: null,
      cover_image: "",
      cover_image_path: "",
      image_file: null,
      image: "",
      file: null,
    }));
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      file: file,
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false,
    }));

    setGalleryImages((prev) => [...prev, ...newItems]);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const handleRemoveGalleryImage = async (idToRemove) => {
    const item = galleryImages.find((img) => img.id === idToRemove);
    if (item && item.isExisting) {
      const idsToDelete = (item.allIds && item.allIds.length > 0) ? item.allIds : (item.id ? [item.id] : []);
      const validIds = idsToDelete.filter((id) => !String(id).startsWith("existing-"));
      setDeletedGalleryImageIds((dPrev) => Array.from(new Set([...dPrev, ...validIds])));

      const currentProdId = String(productId || initialData?.id || "");
      const currentStoreId = String(initialData?.store_id || "");
      for (const id of validIds) {
        try {
          // await api.removeProductImage({ imageId: id, productId: currentProdId, storeId: currentStoreId });
        } catch (e) { }
      }
    }
    setGalleryImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleClearAllGallery = async () => {
    const allExistingIds = [];
    galleryImages.forEach((img) => {
      if (img.isExisting) {
        const ids = (img.allIds && img.allIds.length > 0) ? img.allIds : (img.id ? [img.id] : []);
        ids.forEach((id) => {
          if (!String(id).startsWith("existing-")) {
            allExistingIds.push(id);
          }
        });
      }
    });

    setDeletedGalleryImageIds((prev) => Array.from(new Set([...prev, ...allExistingIds])));
    const currentProdId = String(productId || initialData?.id || "");
    const currentStoreId = String(initialData?.store_id || "");
    for (const id of allExistingIds) {
      try {
        //  await api.removeProductImage({ imageId: id, productId: currentProdId, storeId: currentStoreId });
      } catch (e) { }
    }
    setGalleryImages([]);
  };

  const handleAddAttributeOption = () => {
    if (!newOptionInput.trim()) return;
    const optionName = newOptionInput.trim();
    if (!formData.attribute_options.includes(optionName)) {
      setFormData((prev) => ({
        ...prev,
        attribute_options: [...prev.attribute_options, optionName],
        variants: [
          ...prev.variants,
          { id: optionName, name: optionName, stock: "1", isOpen: true },
        ],
      }));
      setSelectedOptions((prev) => [...prev, optionName]);
    }
    setNewOptionInput("");
  };

  const handleRemoveAttributeOption = (optionName) => {
    setFormData((prev) => ({
      ...prev,
      attribute_options: prev.attribute_options.filter((opt) => opt !== optionName),
      variants: prev.variants.filter((v) => v.name !== optionName),
    }));
    setSelectedOptions((prev) => prev.filter((opt) => opt !== optionName));
  };

  const toggleVariantAccordion = (variantId) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId ? { ...v, isOpen: !v.isOpen } : v
      ),
    }));
  };

  const handleVariantStockChange = (variantId, stockVal) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId ? { ...v, stock: stockVal } : v
      ),
    }));
  };

  const handleRemoveVariant = (variantId) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== variantId),
      attribute_options: prev.attribute_options.filter((opt) => opt !== variantId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const currentProdId = String(productId || initialData?.id || "");
    const currentStoreId = String(initialData?.store_id || "");

    // Delete any pending deleted image IDs on server via remove_image endpoint
    if (deletedGalleryImageIds.length > 0) {
      for (const dId of deletedGalleryImageIds) {
        if (!String(dId).startsWith("existing-")) {
          try {
            await api.removeProductImage({ imageId: dId, productId: currentProdId, storeId: currentStoreId });
          } catch (e) { }
        }
      }
    }

    const productAttributeData = selectedAttributes.map((attr) => {
      const attrOpts = availableAttributeOptions.filter(
        (opt) => String(opt.attributeId) === String(attr.id) && selectedOptions.includes(opt.termText)
      );
      const optionIds = attrOpts.map((opt) => opt.id).filter(Boolean);
      const values = optionIds.length > 0 ? [optionIds.join("|")] : selectedOptions;

      return {
        attribute_id: String(attr.id),
        values: values,
        [`visible_attribute_${attr.id}`]: formData.visible_on_product_page !== false ? "1" : "0",
        [`for_variation_${attr.id}`]: formData.used_for_variations !== false ? "1" : "0",
      };
    });

    const newGalleryFiles = galleryImages
      .filter((img) => !img.isExisting && img.file)
      .map((img) => img.file);

    const existingGalleryIds = [];
    galleryImages.forEach((img) => {
      if (img.isExisting) {
        const ids = (img.allIds && img.allIds.length > 0) ? img.allIds : (img.id ? [img.id] : []);
        ids.forEach((id) => {
          if (!String(id).startsWith("existing-")) {
            existingGalleryIds.push(id);
          }
        });
      }
    });

    const payload = {
      ...formData,
      cover_image_file: selectedCoverFile || formData.cover_image_file || null,
      cover_image: selectedCoverFile || formData.cover_image || formData.cover_image_path || null,
      image_file: selectedCoverFile || formData.image_file || null,
      image: selectedCoverFile || formData.cover_image_path || null,
      file: selectedCoverFile || formData.file || null,
      gallery_files: newGalleryFiles,
      images_files: newGalleryFiles,
      gallery_images: newGalleryFiles,
      existing_gallery_ids: Array.from(new Set(existingGalleryIds)),
      deleted_gallery_ids: Array.from(new Set(deletedGalleryImageIds)),
      selected_attributes: selectedAttributes,
      attribute_id: selectedAttributes.map((a) => a.id).join(","),
      product_attribute: JSON.stringify(productAttributeData),
      variant_product: (formData.used_for_variations && formData.variants.length > 0) ? 1 : 0,
    };

    await onSave(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Product</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Link href="/dashboard" className="text-slate-400 hover:text-brand-600 transition">
              Home
            </Link>
            <span>&gt;</span>
            <Link href="/product" className="text-slate-400 hover:text-brand-600 transition">
              Product
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">{isEditing ? "Edit" : "Create"}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isEditing ? "Update" : "Save"}</span>
        </button>
      </div>

      {/* Main 2-Column Form Layout matching Meetay/Hunter edit screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card 1: Main Informations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Main Informations
            </h3>

            {/* Row 1: Name, Category, Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Name<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Category<span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Weight(Kg)
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="0.000"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Row 2: Purchase Price, Sale Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Purchase Price<span className="text-rose-500">*</span>
                  </label>
                  {isEditing && !isPurchasePriceUnlocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      <Lock className="w-2.5 h-2.5" /> Protected
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={isEditing ? (showPurchasePrice ? "text" : "password") : "number"}
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder={isEditing && !isPurchasePriceUnlocked ? "Click eye icon to unlock" : "Purchase price"}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    readOnly={isEditing && !isPurchasePriceUnlocked}
                    required
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handlePurchasePriceEyeClick}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title={
                        !isPurchasePriceUnlocked
                          ? "Click to enter password and view purchase price"
                          : showPurchasePrice
                            ? "Hide price"
                            : "Show price"
                      }
                    >
                      {showPurchasePrice ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Sale Price<span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  placeholder="Sale price"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Sub-Section: Main Informations Toggles */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Main Informations</h4>
              <div className="flex items-center gap-8">
                {/* New Arrival Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, new_arrival: !formData.new_arrival })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.new_arrival ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.new_arrival ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                  <span className="text-xs text-slate-700 font-medium">New Arrival</span>
                </div>

                {/* Display Product Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, display_product: !formData.display_product })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.display_product ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.display_product ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                  <span className="text-xs text-slate-700 font-medium">Display Product</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Product Images & Gallery */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Images className="w-4 h-4 text-emerald-600" />
                Product Images
              </h3>
              {galleryImages.length > 0 && (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {galleryImages.length} {galleryImages.length === 1 ? "gallery image" : "gallery images"}
                </span>
              )}
            </div>

            {/* 1. Cover Image (Main Image) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Cover Image <span className="text-slate-400 font-normal">(Primary Display)</span>
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-medium transition cursor-pointer"
                  >
                    Remove Cover
                  </button>
                )}
              </div>

              {/* Hidden file picker */}
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFileChange}
              />

              <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs cursor-pointer"
                >
                  Choose Cover
                </button>
                <span className="text-xs text-slate-500 ml-3 truncate flex-1" title={formData.cover_image_file?.name || ""}>
                  {formData.cover_image_file?.name || (imagePreview ? "Cover image selected" : "No file chosen")}
                </span>
              </div>

              {/* Cover Preview */}
              {imagePreview && !imgError ? (
                <div className="mt-2 relative inline-block">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-emerald-500/40 bg-white relative shadow-2xs group">
                    <img
                      src={imagePreview}
                      alt="Cover Preview"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-semibold bg-emerald-600 text-white rounded px-1 py-0.5 shadow-xs">
                      Cover
                    </span>
                  </div>
                  {/* <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 shadow transition"
                    title="Remove cover image"
                  >
                    <X className="w-3 h-3" />
                  </button> */}
                </div>
              ) : (
                <div className="mt-2 w-24 h-24 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">No cover</span>
                </div>
              )}
            </div>

            {/* 2. Multiple Gallery Images */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Gallery Images <span className="text-emerald-600 font-medium">(Multiple Uploads)</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Add multiple product angle shots or detail images
                  </p>
                </div>
                {galleryImages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllGallery}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-medium transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Hidden multi-file picker */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryFilesChange}
              />

              {/* Upload Dropzone / Button */}
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition text-center group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  <span className="text-emerald-600 font-bold">Click to choose multiple images</span> or drag & drop
                </div>
                <div className="text-[10px] text-slate-400">
                  Supports PNG, JPG, JPEG, WEBP (Select multiple files at once)
                </div>
              </div>

              {/* Gallery Previews Grid */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs aspect-square"
                    >
                      <img
                        src={img.url}
                        alt="Gallery Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Badge (New / Existing) */}
                      <span
                        className={`absolute bottom-1 left-1 text-[9px] font-semibold px-1 py-0.5 rounded shadow-xs ${img.isExisting
                          ? "bg-slate-800/80 text-white"
                          : "bg-emerald-600 text-white"
                          }`}
                      >
                        {img.isExisting ? "Existing" : "New"}
                      </span>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveGalleryImage(img.id);
                        }}
                        className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow transition opacity-90 group-hover:opacity-100 cursor-pointer"
                        title="Delete image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card 3: Product Attribute */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Product Attribute
            </h3>

            {/* 1. Attribute Select Box (Multi-Attribute) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Product Attribute
              </label>
              <div className="relative" ref={attrDropdownRef}>
                <div
                  onClick={() => setIsAttrDropdownOpen(!isAttrDropdownOpen)}
                  className={`w-full bg-white border-2 rounded-lg p-2 flex flex-wrap items-center gap-1.5 cursor-pointer shadow-xs min-h-[42px] transition ${isAttrDropdownOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-emerald-500"
                    }`}
                >
                  {selectedAttributes.length === 0 ? (
                    <span className="text-xs text-slate-400 font-medium">Please Select Attributes...</span>
                  ) : (
                    selectedAttributes.map((attr) => (
                      <span
                        key={attr.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold shadow-2xs"
                      >
                        <span>{attr.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAttribute(attr.id);
                          }}
                          className="hover:opacity-80 ml-0.5 text-white/90 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                  {selectedAttributes.length > 0 && (
                    <span className="text-xs text-slate-400 font-medium">+ Add more</span>
                  )}
                </div>

                {/* Attribute Dropdown Menu */}
                {isAttrDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden text-xs animate-in fade-in">
                    {allAttributes.filter((attr) => !selectedAttributes.some((a) => String(a.id) === String(attr.id))).length === 0 ? (
                      <div className="p-3 text-slate-400 text-center bg-slate-50 font-medium">
                        No choices to choose from
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {allAttributes
                          .filter((attr) => !selectedAttributes.some((a) => String(a.id) === String(attr.id)))
                          .map((attr) => (
                            <div
                              key={attr.id}
                              onClick={() => {
                                handleToggleAttribute(attr);
                                setIsAttrDropdownOpen(false);
                              }}
                              className="p-2.5 flex items-center justify-between hover:bg-emerald-50/70 cursor-pointer transition text-slate-800 font-medium"
                            >
                              <span>{attr.name}</span>
                              <span className="text-[10px] text-slate-400">Press to select</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Values Multi-Select & Variations Toggle */}
            {selectedAttributes.length > 0 && (
              <div className="space-y-3 pt-2">
                {/* Toggle: Used for variations */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        used_for_variations: !prev.used_for_variations,
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.used_for_variations ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.used_for_variations ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-800">Used for variations</span>
                </div>

                {/* Values Dropdown Multi-Select Box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Attribute Values
                  </label>
                  <div className="relative" ref={optionsDropdownRef}>
                    <div
                      onClick={() => setIsOptionsDropdownOpen(!isOptionsDropdownOpen)}
                      className={`w-full bg-white border-2 rounded-lg p-2 flex flex-wrap items-center gap-1.5 cursor-pointer shadow-xs min-h-[42px] transition ${isOptionsDropdownOpen ? "border-emerald-500 ring-1 ring-emerald-500" : "border-emerald-500"
                        }`}
                    >
                      {selectedOptions.length === 0 ? (
                        <span className="text-xs text-slate-400 font-medium">Click to select values...</span>
                      ) : (
                        selectedOptions.map((opt) => (
                          <span
                            key={opt}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-xs font-semibold shadow-2xs"
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAttributeOption(opt);
                              }}
                              className="hover:opacity-80 text-white/90 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Options Dropdown Menu */}
                    {isOptionsDropdownOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden text-xs max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
                        {availableAttributeOptions.filter((opt) => !selectedOptions.includes(opt.termText)).length === 0 ? (
                          <div className="p-3 text-slate-400 text-center bg-slate-50 font-medium">
                            No choices to choose from
                          </div>
                        ) : (
                          availableAttributeOptions
                            .filter((opt) => !selectedOptions.includes(opt.termText))
                            .map((optItem) => {
                              const termText = optItem.termText;

                              return (
                                <div
                                  key={optItem.id || termText}
                                  onClick={() => {
                                    setSelectedOptions((prev) => [...prev, termText]);
                                    setFormData((prev) => ({
                                      ...prev,
                                      attribute_options: [...prev.attribute_options, termText],
                                      variants: [
                                        ...prev.variants,
                                        { id: termText, name: termText, stock: "1", isOpen: true },
                                      ],
                                    }));
                                    setIsOptionsDropdownOpen(false);
                                  }}
                                  className="px-3 py-2.5 flex items-center justify-between cursor-pointer transition hover:bg-emerald-50/70 text-slate-800 font-medium"
                                >
                                  <span>{termText}</span>
                                  <span className="text-[10px] text-slate-400">
                                    Press to select
                                  </span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Variant Cards / Accordions */}
            <div className="space-y-3 pt-2">
              {formData.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
                >
                  {/* Accordion Header */}
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-bold text-slate-800">{variant.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleVariantAccordion(variant.id)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {variant.isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                        title="Delete variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {variant.isOpen && (
                    <div className="p-3">
                      <label className="block text-xs text-slate-600 mb-1 font-medium">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantStockChange(variant.id, e.target.value)}
                        className="w-full sm:w-48 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: About Product with Rich Text Editors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              About product
            </h3>

            {/* Product Description */}
            <RichTextEditor
              label="Product Description"
              value={formData.description}
              onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
              placeholder="Enter comprehensive product description..."
              minHeight="110px"
            />

            {/* Product Specification */}
            <RichTextEditor
              label="Product Specification"
              value={formData.specification}
              onChange={(html) => setFormData((prev) => ({ ...prev, specification: html }))}
              placeholder="Enter product materials, measurements, fit..."
              minHeight="110px"
            />

            {/* Product Details */}
            <RichTextEditor
              label="Product Details"
              value={formData.detail}
              onChange={(html) => setFormData((prev) => ({ ...prev, detail: html }))}
              placeholder="Enter care instructions, packaging details..."
              minHeight="110px"
            />
          </div>
        </div>
      </div>

      {/* Password Verification Modal for Purchase Price */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => !verifyLoading && setShowPasswordModal(false)}
        title="Verify Password"
        description="Enter password to view and edit the purchase price"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {/* Error Message */}
          {verifyError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Admin Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showModalPassword ? "text" : "password"}
                value={verifyPasswordInput}
                onChange={(e) => setVerifyPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleVerifyPurchasePrice();
                  }
                }}
                placeholder="Enter password"
                autoFocus
                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowModalPassword(!showModalPassword)}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              disabled={verifyLoading}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerifyPurchasePrice}
              disabled={verifyLoading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {verifyLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify Password</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
