import React from "react";
import Link from "next/link";
import { Palette, ExternalLink, Sparkles, Sliders } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ActiveThemeCard({ store, themeName = "Stylique" }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
      {/* Theme Header & Thumbnail Image */}
      <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
          alt="Active Theme"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Store badge & theme name badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="brand" size="md" className="bg-brand-600/90 backdrop-blur-md text-white border-0 shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>Active Store Theme</span>
          </Badge>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
            {store?.name || "Meetay Store"}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <h4 className="text-xl font-bold text-white tracking-tight capitalize flex items-center gap-2">
            {themeName} Edition
          </h4>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
            Luxury runway lifestyle & fashion retail experience
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <Link href={`/theme-customize/${themeName.toLowerCase()}/customize`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full" icon={Sliders}>
            Customize Theme
          </Button>
        </Link>
        <Link href="/theme-customize" className="flex-1">
          <Button variant="outline" size="sm" className="w-full" icon={Palette}>
            Manage Themes
          </Button>
        </Link>
      </div>
    </div>
  );
}
