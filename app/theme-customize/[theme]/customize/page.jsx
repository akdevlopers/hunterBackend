"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Palette,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowLeft,
  Eye,
  GripVertical,
  LayoutTemplate,
  Home,
  Footprints,
  BookOpen,
  PhoneCall,
  FileText,
  ShoppingCart,
  CreditCard,
  Package,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DynamicFieldRenderer } from "@/components/theme-customize/DynamicFieldRenderer";
import { LiveThemePreview } from "@/components/theme-customize/LiveThemePreview";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { THEME_PAGES, THEME_SECTION_SCHEMAS } from "@/lib/themeSchemas";

const ICON_MAP = {
  LayoutTemplate,
  Home,
  Footprints,
  BookOpen,
  PhoneCall,
  FileText,
  ShoppingCart,
  CreditCard,
  Package,
};

export default function ThemeCustomizerDetailPage() {
  const params = useParams();
  const themeId = (params?.theme || "stylique").toString().toLowerCase();

  const pages = THEME_PAGES[themeId] || THEME_PAGES.stylique || [];
  const [activePageSlug, setActivePageSlug] = useState(pages[0]?.slug || "header");
  const [activeSectionSlug, setActiveSectionSlug] = useState("");
  const [settings, setSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState("");

  // Load current page schema
  const currentSchema = api.getThemeSectionSchema(themeId, activePageSlug);
  const sections = currentSchema?.sections || [];

  // Initialize active section when page changes
  useEffect(() => {
    if (sections.length > 0) {
      setActiveSectionSlug(sections[0].slug);
    }
  }, [activePageSlug]);

  // Load saved settings
  useEffect(() => {
    const saved = api.getThemeSettings(themeId, activePageSlug);
    setSettings(saved);
  }, [themeId, activePageSlug]);

  const activeSection = sections.find((s) => s.slug === activeSectionSlug) || sections[0];

  const handleFieldChange = (fieldKey, value) => {
    setSettings((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    api.saveThemeSettings(themeId, activePageSlug, settings);
    setTimeout(() => {
      setIsSaving(false);
      setSaveToast("Theme settings successfully saved and applied!");
      setTimeout(() => setSaveToast(""), 3500);
    }, 400);
  };

  const activePageMeta = pages.find((p) => p.slug === activePageSlug);

  return (
    <AppLayout>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/theme-customize">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              All Themes
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight capitalize">
                {themeId} Customizer
              </h1>
              <Badge variant="brand" size="xs">Live Editor</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Editing: <span className="font-semibold text-slate-700 dark:text-slate-300">{activePageMeta?.title || "Page"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePageMeta?.is_order && (
            <Link href={`/theme-customize/${themeId}/order`}>
              <Button variant="outline" size="sm" icon={GripVertical}>
                Section Order
              </Button>
            </Link>
          )}
          <Button variant="primary" size="sm" loading={isSaving} onClick={handleSave} icon={Check}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Save Notification Alert */}
      {saveToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>✓ {saveToast}</span>
          <button onClick={() => setSaveToast("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* Main Workspace Split: Settings Panel (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Jump To Page + Section Settings Form (5 cols on XL) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Jump To Page Horizontal/Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Jump To Store Page
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {pages.map((p) => {
                const isActive = activePageSlug === p.slug;
                const IconComponent = ICON_MAP[p.icon] || LayoutTemplate;
                return (
                  <button
                    key={p.slug}
                    onClick={() => setActivePageSlug(p.slug)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                      isActive
                        ? "bg-brand-600 text-white font-semibold shadow-sm shadow-brand-500/20"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jump To Section Tabs & Form Fields */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentSchema?.title || `${activePageSlug} Settings`}
                </h3>
                <span className="text-xs text-slate-400">
                  {sections.length} {sections.length === 1 ? "Section" : "Sections"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentSchema?.detail || "Configure custom components and visual styling."}
              </p>
            </div>

            {/* Jump To Section Sub-tabs */}
            {sections.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                {sections.map((sec) => (
                  <button
                    key={sec.slug}
                    onClick={() => setActiveSectionSlug(sec.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeSectionSlug === sec.slug
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            )}

            {/* Form Fields for Active Section */}
            {activeSection ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    {activeSection.title} Options
                  </h4>
                </div>

                <div className="space-y-4">
                  {activeSection.settings?.map((field) => {
                    const fieldKey = `${activeSection.key}_${field.key}`;
                    const currentValue = settings[fieldKey] !== undefined ? settings[fieldKey] : field.value;

                    return (
                      <div key={fieldKey} className="space-y-1.5">
                        <DynamicFieldRenderer
                          setting={field}
                          value={currentValue}
                          onChange={(val) => handleFieldChange(fieldKey, val)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No section settings available for this page.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Storefront Preview (7 cols on XL) */}
        <div className="xl:col-span-7 sticky top-20">
          <LiveThemePreview
            themeId={themeId}
            settings={settings}
            activePage={activePageSlug}
          />
        </div>
      </div>
    </AppLayout>
  );
}
