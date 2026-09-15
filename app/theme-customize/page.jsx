"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Palette, Sparkles, Sliders, Check, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeCard } from "@/components/theme-customize/ThemeCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { THEMES_LIST } from "@/lib/themeSchemas";

export default function ThemeCustomizeCatalogPage() {
  const [themes, setThemes] = useState(THEMES_LIST);
  const [activeThemeId, setActiveThemeId] = useState("stylique");
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    async function load() {
      const active = api.getActiveTheme();
      setActiveThemeId(active);
      const list = await api.getThemes();
      setThemes(list);
    }
    load();
  }, []);

  const handleMakeActive = (themeId) => {
    api.setActiveTheme(themeId);
    setActiveThemeId(themeId);
    setThemes(
      themes.map((t) => ({
        ...t,
        isActive: t.id === themeId,
      }))
    );
    setSuccessToast(`Theme "${themeId}" is now set as active.`);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50/70 to-slate-100 dark:from-brand-950/60 dark:via-indigo-950/40 dark:to-slate-900 border border-brand-200/80 dark:border-brand-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Theme Engine</span>
            <Badge variant="brand" size="xs">3 Themes Installed</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Theme Customization & Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Switch your storefront visual aesthetic, customize banners, headers, footers, and preview live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/theme-customize/${activeThemeId}/customize`}>
            <Button variant="primary" size="md" icon={Sliders}>
              Customize Active ({activeThemeId})
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Alert */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>✓ {successToast}</span>
          <button onClick={() => setSuccessToast("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* Theme Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Available Themes</h2>
            <p className="text-xs text-slate-500">Select any theme to customize or activate for your store</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onMakeActive={handleMakeActive}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
