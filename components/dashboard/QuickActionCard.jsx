"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  Sparkles,
  ShoppingBag,
  Percent,
  Layers,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function QuickActionCard({ user, store, themeUrl }) {
  const [copied, setCopied] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const effectiveThemeUrl = themeUrl || `https://localhost/meetay/store/${store?.slug || "stylique"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(effectiveThemeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: store?.name || "Meetay Store",
        text: "Discover our online store powered by Meetay!",
        url: effectiveThemeUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Profile & Greeting */}
      <div className="flex items-start gap-3.5">
        <img
          src={user?.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
          alt={user?.name || "Admin"}
          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20 shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {user?.name || "Administrator"}
            </h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            Welcome back! You can quickly add products, configure tax policies, or share your storefront link.
          </p>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Quick Add Dropdown */}
        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setQuickAddOpen(!quickAddOpen)}
          >
            Quick Add
          </Button>

          {quickAddOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setQuickAddOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-left"
              >
                <ShoppingBag className="w-4 h-4 text-brand-500" />
                <span>Add New Product</span>
              </button>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-left"
              >
                <Percent className="w-4 h-4 text-emerald-500" />
                <span>Add New Tax Rule</span>
              </button>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-left"
              >
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Add Main Category</span>
              </button>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-left"
              >
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Add Promo Coupon</span>
              </button>
            </div>
          )}
        </div>

        {/* Copy Theme Link */}
        <Button
          variant="outline"
          size="sm"
          icon={copied ? Check : Copy}
          onClick={handleCopyLink}
          className={copied ? "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : ""}
        >
          {copied ? "Link Copied!" : "Theme Link"}
        </Button>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          icon={Share2}
          onClick={handleShare}
          title="Share Store Link"
        >
          Share
        </Button>

        {/* QR Code Modal Trigger */}
        <Button
          variant="outline"
          size="sm"
          icon={QrCode}
          onClick={() => setQrModalOpen(true)}
          title="View Store QR Code"
        >
          QR Code
        </Button>
      </div>

      {shareToast && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ Storefront link copied to clipboard for instant sharing!
        </p>
      )}

      {/* Store QR Code Modal */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Storefront QR Code"
        description="Scan this QR code from any mobile device to directly access your live storefront."
      >
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
            <QRCodeSVG
              value={effectiveThemeUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{store?.name || "Meetay Store"}</p>
            <p className="text-xs text-slate-500 break-all max-w-xs">{effectiveThemeUrl}</p>
          </div>
          <div className="flex items-center gap-2 w-full pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              icon={Copy}
              onClick={handleCopyLink}
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              icon={ExternalLink}
              onClick={() => window.open(effectiveThemeUrl, "_blank")}
            >
              Open Store
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
