"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, Sliders, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ThemeCard({ theme, onMakeActive }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      {/* Thumbnail Banner */}
      <div className="relative h-52 bg-slate-950 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-tr ${theme.fallbackColor} opacity-30 group-hover:opacity-40 transition-opacity`} />
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
          alt={theme.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant={theme.isActive ? "success" : "default"} size="sm" className="backdrop-blur-md">
            {theme.isActive ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Currently Active</span>
              </>
            ) : (
              <span>v{theme.version}</span>
            )}
          </Badge>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
            {theme.category}
          </span>
        </div>

        {/* Bottom Title */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {theme.name}
            {theme.isActive && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{theme.description}</p>
        </div>
      </div>

      {/* Card Body with Tags */}
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {theme.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <Link href={`/theme-customize/${theme.id}/customize`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full" icon={Sliders}>
            Customize
          </Button>
        </Link>
        {!theme.isActive && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMakeActive && onMakeActive(theme.id)}
          >
            Make Active
          </Button>
        )}
      </div>
    </div>
  );
}
