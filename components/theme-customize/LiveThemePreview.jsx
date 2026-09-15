"use client";

import React, { useState } from "react";
import { Monitor, Tablet, Smartphone, Sparkles, ExternalLink, RefreshCw, ShoppingBag, Search, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LiveThemePreview({ themeId = "stylique", settings = {}, activePage = "home" }) {
  const [viewport, setViewport] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'

  const viewportWidths = {
    desktop: "w-full max-w-4xl",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  // Extract relevant settings with fallbacks
  const announcementText = settings["top_bar_text"] || "✨ Autumn Collection 2026 Live: Get 25% Off with code STYLIQUE25 | Free Global Delivery";
  const showAnnouncement = settings["top_bar_status"] !== 0 && settings["top_bar_status"] !== "0";
  const logoImage = settings["header_logo"] || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=60";
  const searchPlaceholder = settings["header_search_title"] || "Search high fashion clothing, luxury accessories...";
  const sliderItems = Array.isArray(settings["slider_repeater"])
    ? settings["slider_repeater"]
    : typeof settings["slider_repeater"] === "string"
    ? (() => {
        try {
          return JSON.parse(settings["slider_repeater"]);
        } catch (e) {
          return [];
        }
      })()
    : [
        {
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
          big_text: "Elevate Your Signature Style",
          content: "Discover the latest haute couture & timeless runway pieces handcrafted for modern sophistication.",
          button_text: "Shop Collection",
        },
      ];

  const firstSlide = sliderItems[0] || {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
    big_text: "Elevate Your Signature Style",
    content: "Discover the latest haute couture & timeless runway pieces.",
    button_text: "Shop Collection",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[640px]">
      {/* Viewport bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-semibold text-slate-400 ml-2 hidden sm:inline">
            Interactive Live Storefront Preview ({themeId})
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded-lg transition ${viewport === "desktop" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-lg transition ${viewport === "tablet" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            title="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`p-1.5 rounded-lg transition ${viewport === "mobile" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-950/60 p-4 sm:p-6 overflow-y-auto flex items-start justify-center">
        <div className={`${viewportWidths[viewport]} bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-300 font-sans text-xs`}>
          {/* Top Announcement Bar */}
          {showAnnouncement && (
            <div className="bg-slate-950 text-white px-3 py-1.5 text-center text-[10px] sm:text-xs font-medium tracking-wide">
              {announcementText}
            </div>
          )}

          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Logo" className="h-7 w-auto object-contain rounded" />
              <span className="font-bold tracking-tight text-sm capitalize">{themeId}</span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="text-brand-600 font-semibold">Home</span>
              <span>Collections</span>
              <span>Lookbook</span>
              <span>Stories</span>
            </div>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500 cursor-pointer" />
              <Heart className="w-4 h-4 text-slate-500 cursor-pointer" />
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-slate-700 dark:text-slate-200 cursor-pointer" />
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-brand-600 text-white text-[8px] font-bold flex items-center justify-center">
                  2
                </span>
              </div>
            </div>
          </div>

          {/* Hero Slider Section */}
          <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden flex items-center">
            <img
              src={firstSlide.image}
              alt="Slide"
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="relative z-10 px-6 sm:px-10 max-w-md text-white space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400">
                New Season Highlight
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                {firstSlide.big_text}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-2">
                {firstSlide.content}
              </p>
              <button className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg transition">
                {firstSlide.button_text || "Explore Now"}
              </button>
            </div>
          </div>

          {/* Product Category Preview Row */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {settings["category_title"] || "Featured Collections"}
                </h4>
                <p className="text-[11px] text-slate-500">Curated runway items</p>
              </div>
              <span className="text-xs text-brand-600 font-semibold">View All</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Evening Gown", price: "₹ 1,450", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&auto=format&fit=crop&q=80" },
                { name: "Leather Tote", price: "₹ 890", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80" },
                { name: "Runway Pumps", price: "₹ 650", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&auto=format&fit=crop&q=80" },
                { name: "Silk Scarf", price: "₹ 220", img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300&auto=format&fit=crop&q=80" },
              ].map((prod, i) => (
                <div key={i} className="group/item rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2 space-y-2">
                  <img src={prod.img} alt={prod.name} className="w-full h-24 sm:h-28 object-cover rounded-lg" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{prod.name}</p>
                    <p className="text-brand-600 font-bold">{prod.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Preview */}
          <div className="bg-slate-950 text-slate-400 p-5 space-y-3 border-t border-slate-800 text-[11px]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-semibold text-white">Meetay {themeId}</span>
              <span>{settings["footer_brand_copyright"] || "© 2026 Meetay Technologies. All Rights Reserved."}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
