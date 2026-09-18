"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import appLogo from "@/app/assets/app logo.png";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Store,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MOCK_USER } from "@/lib/mockData";


export function Header({ setIsMobileOpen }) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const u = api.getCurrentUser();
    if (u) setCurrentUser(u);
  }, []);

  const user = currentUser || MOCK_USER;

  const handleSignOut = async () => {
    await api.logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 print:hidden">
      {/* Left section: mobile hamburger & mobile app logo */}
      <div className="flex items-center gap-2.5 flex-1 max-w-lg">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* App Logo - Visible ONLY on Mobile View (< lg) */}
        <Link href="/dashboard" className="flex items-center lg:hidden py-1">
          <Image
            src={appLogo}
            alt="Hunter Logo"
            className="h-7 sm:h-8 w-auto object-contain max-w-[140px]"
            priority
          />
        </Link>
      </div>

      {/* Right Section: Store Link, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Store Live Link */}
        <a
          href="https://hunterclothing.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <Store className="w-3.5 h-3.5 text-brand-600" />
          <span>Live Storefront</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Notifications */}
        {/* <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h4>
                <Badge variant="brand" size="xs">3 New</Badge>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">New Order #ORD-9481</p>
                  <p className="text-slate-500 mt-0.5">Eleanor Vance placed an order for ₹ 1,450.00</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">5 minutes ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Theme Stylique Activated</p>
                  <p className="text-slate-500 mt-0.5">Customization changes applied successfully</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div> */}

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            
            <div className="text-left hidden xl:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role || user.type || "admin"}</p>
            </div>
            {/* <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> */}
          </button>

          {/* {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="py-1 space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account Profile</span>
                </button>
               
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </header>
  );
}
