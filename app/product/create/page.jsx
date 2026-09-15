"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductForm } from "@/components/product/ProductForm";
import { api } from "@/lib/api";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const cats = await api.getCategories();
      setCategories(cats);
    }
    fetchCategories();
  }, []);

  const handleSave = async (formData) => {
    await api.createProduct(formData);
    router.push("/product");
  };

  return (
    <AppLayout>
      <ProductForm
        categories={categories}
        onSave={handleSave}
        isEditing={false}
      />
    </AppLayout>
  );
}
