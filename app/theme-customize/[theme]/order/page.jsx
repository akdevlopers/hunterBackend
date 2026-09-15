"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, GripVertical, Check, Sliders, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionOrderSorter } from "@/components/theme-customize/SectionOrderSorter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function ThemeSectionOrderPage() {
  const params = useParams();
  const themeId = (params?.theme || "stylique").toString().toLowerCase();

  const [sections, setSections] = useState([
    "slider",
    "category",
    "product",
    "top_category",
    "bestseller",
    "more_offer",
    "article",
    "testimonial",
    "logos",
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const order = api.getSectionOrder(themeId, "home");
    if (order && order.length > 0) {
      setSections(order);
    }
  }, [themeId]);

  const handleSave = () => {
    setIsSaving(true);
    api.saveSectionOrder(themeId, "home", sections);
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage("Page section layout order saved successfully!");
      setTimeout(() => setToastMessage(""), 3500);
    }, 400);
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`/theme-customize/${themeId}/customize`}>
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Customizer
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight capitalize">
                {themeId} Section Ordering
              </h1>
              <Badge variant="brand" size="xs">Home Page</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Customize the vertical placement order of sections on your storefront home page.
            </p>
          </div>
        </div>

        <Link href={`/theme-customize/${themeId}/customize`}>
          <Button variant="outline" size="sm" icon={Sliders}>
            Configure Settings
          </Button>
        </Link>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>✓ {toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* Sorter Component */}
      <div className="max-w-3xl mx-auto">
        <SectionOrderSorter
          sections={sections}
          onReorder={setSections}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </AppLayout>
  );
}
