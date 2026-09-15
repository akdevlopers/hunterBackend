"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/product/ProductForm";
import { api } from "@/lib/api";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id, 10);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [prodsRes, cats, prodDetails] = await Promise.all([
        api.getProducts({ page: 1, limit: 100 }),
        api.getCategories(),
        api.getProductById(productId),
      ]);

      setCategories(cats || []);

      const prodList = Array.isArray(prodsRes)
        ? prodsRes
        : prodsRes?.products || prodsRes?.data || [];

      const found =
        prodDetails ||
        prodList.find((p) => String(p.id) === String(productId)) ||
        prodList[0] ||
        null;

      setProduct(found);
      setLoading(false);
    }

    if (productId) {
      loadData();
    }
  }, [productId]);


  const handleSave = async (formData) => {
    await api.updateProduct(productId, formData);
    router.push("/product");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-400">Loading product details...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ProductForm
        initialData={product}
        productId={productId}
        categories={categories}
        onSave={handleSave}
        isEditing={true}
      />
    </AppLayout>
  );
}
