"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import appLogo from "@/app/assets/app logo.png";
import {
  LayoutDashboard,
  BarChart3,
  Palette,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Store,
  ChevronLeft,
  X,
  Circle,
  Tag,
  Layers,
  Briefcase,
  User,
  Scan,
  Truck,
  PartyPopper,
  BarChart2,
  LogOut,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

const NAV_ITEMS = [
  {
    title: "Navigation",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        badge: null,
      },
      // {
      //   name: "Analytics",
      //   href: "/analytics",
      //   icon: BarChart3,
      //   badge: null,
      // },
      // {
      //   name: "Theme Customize",
      //   href: "/theme-customize",
      //   icon: Palette,
      //   badge: null,
      // },
      {
        name: "Products",
        href: "/products",
        icon: ShoppingBag,
        badge: null,
        children: [
          {
            name: "Category",
            href: "/category",
          },
          {
            name: "Product",
            href: "/product",
          },
          {
            name: "Attributes",
            href: "/attributes",
          },
        ],
      },
      {
        name: "Orders",
        href: "/order",
        icon: Briefcase,
        badge: null,
        children: [
          {
            name: "Orders",
            href: "/order",
          },
          {
            name: "Sale Book(OnlineOrders)",
            href: "/order/sale-book",
          },
          {
            name: "Profit/Loss(OnlineOrders)",
            href: "/order/profit-loss",
            protectedType: "online_sale_profilt_loss",
          },
        ],
      },
      {
        name: "Customers",
        href: "/customer",
        icon: User,
        badge: null,
      },
      {
        name: "POS",
        href: "/pos",
        icon: Scan,
        badge: null,
      },
      // {
      //   name: "Shipping",
      //   href: "/shipping",
      //   icon: Truck,
      //   badge: null,
      //   children: [
      //     {
      //       name: "Shipping Class",
      //       href: "/shipping",
      //     },
      //     {
      //       name: "Shipping Zone",
      //       href: "/shipping-zone",
      //     },
      //   ],
      // },
      {
        name: "Sales",
        href: "/pos-order-list",
        icon: PartyPopper,
        badge: null,
        children: [
          {
            name: "Sale Book",
            href: "/pos-order-list",
          },
          {
            name: "Profit / Loss",
            href: "/profit-loss",
            protectedType: "pos_sale_profilt_loss",
          },
          {
            name: "Stock Report",
            href: "/stock-report-hunter",
          },
          {
            name: "Product Return",
            href: "/product-return",
          },
        ],
      },
      // {
      //   name: "Reports",
      //   href: "/reports",
      //   icon: BarChart2,
      //   badge: null,
      //   children: [
      //     {
      //       name: "Customer Reports",
      //       href: "/reports",
      //     },
      //   ],
      // },
    ],
  },
];

export function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Protected menu state
  const [protectedModalItem, setProtectedModalItem] = useState(null); // { name, href, protectedType }
  const [menuPasswordInput, setMenuPasswordInput] = useState("");
  const [showMenuPassword, setShowMenuPassword] = useState(false);
  const [menuVerifyLoading, setMenuVerifyLoading] = useState(false);
  const [menuVerifyError, setMenuVerifyError] = useState("");

  const handleProtectedMenuClick = (e, sub) => {
    e.preventDefault();
    setProtectedModalItem(sub);
    setMenuPasswordInput("");
    setMenuVerifyError("");
    setShowMenuPassword(false);
  };

  const handleVerifyMenuPassword = async (e) => {
    if (e) e.preventDefault();
    if (!menuPasswordInput.trim()) {
      setMenuVerifyError("Please enter your password.");
      return;
    }

    setMenuVerifyLoading(true);
    setMenuVerifyError("");

    try {
      const res = await api.verifyPassword({
        password: menuPasswordInput,
        type: protectedModalItem?.protectedType || "pos_sale_profilt_loss",
      });

      if (res && (res.success === true || res.status === "success")) {
        const targetHref = protectedModalItem.href;
        setProtectedModalItem(null);
        setMenuPasswordInput("");
        setIsMobileOpen(false);
        router.push(targetHref);
      } else {
        setMenuVerifyError(res?.message || res?.error || "Incorrect password. Access denied.");
      }
    } catch (err) {
      setMenuVerifyError(err.message || "Failed to verify password. Please try again.");
    } finally {
      setMenuVerifyLoading(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await api.logout();
    window.location.href = "/login";
  };

  // Automatically keep only the active parent menu open when on an inside child route
  useEffect(() => {
    let activeSubmenus = {};
    NAV_ITEMS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some((c) => {
            if (pathname === c.href) return true;
            if (c.href !== "/" && pathname.startsWith(c.href + "/")) return true;
            return false;
          });
          if (isChildActive) {
            activeSubmenus[item.name] = true;
          }
        }
      });
    });
    setOpenSubmenus(activeSubmenus);
  }, [pathname]);

  const toggleSubmenu = (name) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
            {collapsed ? (
              <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-white font-black italic shadow-sm shrink-0">
                <span className="text-base tracking-tighter">H</span>
              </div>
            ) : (
              <div className="flex items-center min-w-0 py-1">
                <Image
                  src={appLogo}
                  alt="Hunter Logo"
                  className="h-8 w-auto object-contain max-w-[180px]"
                  priority
                />
              </div>
            )}
          </Link>

          {/* Close for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_ITEMS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1 pt-1">
                {section.items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isSubmenuOpen = openSubmenus[item.name];

                  const activeChild = hasChildren
                    ? item.children.find((c) => pathname === c.href) ||
                      item.children
                        .filter((c) => c.href !== "/" && pathname.startsWith(c.href + "/"))
                        .sort((a, b) => b.href.length - a.href.length)[0] || null
                    : null;

                  const isItemActive = hasChildren
                    ? !!activeChild
                    : pathname === item.href || (item.href !== "/dashboard" && item.href !== "#!" && pathname.startsWith(item.href + "/"));
                  const Icon = item.icon;

                  if (hasChildren) {
                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => toggleSubmenu(item.name)}
                          className={cn(
                            "w-full group flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 relative cursor-pointer",
                            isItemActive
                              ? "bg-brand-50/80 text-brand-700 font-semibold border border-brand-200/70 shadow-xs"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                          )}
                          title={collapsed ? item.name : undefined}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isItemActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-600 rounded-r-full shadow-xs" />
                            )}
                            <Icon
                              className={cn(
                                "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                                isItemActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                              )}
                            />
                            {!collapsed && (
                              <span className="whitespace-nowrap font-medium text-sm">{item.name}</span>
                            )}
                          </div>

                          {!collapsed && (
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isItemActive ? "text-brand-600" : "text-slate-400",
                                isSubmenuOpen && "transform rotate-180"
                              )}
                            />
                          )}
                        </button>

                        {/* Collapsible Submenu */}
                        {!collapsed && isSubmenuOpen && (
                          <div className="ml-4 pl-3.5 border-l-2 border-slate-100 my-1 space-y-1">
                            {item.children.map((sub) => {
                              const isSubActive = activeChild && activeChild.href === sub.href;
                              return (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={(e) => {
                                    if (sub.protectedType) {
                                      handleProtectedMenuClick(e, sub);
                                    } else {
                                      setIsMobileOpen(false);
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 relative group/sub",
                                    isSubActive
                                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-md shadow-brand-500/20"
                                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-colors shrink-0",
                                        isSubActive ? "bg-white shadow-xs" : "bg-slate-300"
                                      )}
                                    />
                                    <span className="truncate">{sub.name}</span>
                                  </div>
                                  {sub.protectedType && (
                                    <Lock
                                      className={cn(
                                        "w-3 h-3 shrink-0 transition-colors",
                                        isSubActive ? "text-white/80" : "text-slate-400 group-hover/sub:text-slate-600"
                                      )}
                                    />
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 relative",
                        isItemActive
                          ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold shadow-md shadow-brand-500/25"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                          isItemActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="whitespace-nowrap font-medium text-sm">{item.name}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0 ml-2 transition-colors",
                                isItemActive ? "bg-white/20 text-white backdrop-blur-xs" : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions: Logout & Desktop Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-white">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 transition-all duration-150 group cursor-pointer",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0 text-slate-400 group-hover:text-rose-600 transition-colors" />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </button>

          <div className="hidden lg:flex items-center justify-end pt-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Dialog Box */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => !isLoggingOut && setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-md shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-1 pt-0.5">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">Confirm Logout</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to log out of your session? You will need to sign in again to access the dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password Verification Modal for Sales / Protected Menus */}
      <Modal
        isOpen={!!protectedModalItem}
        onClose={() => !menuVerifyLoading && setProtectedModalItem(null)}
        title={`Verify Password - ${protectedModalItem?.name || "Protected Menu"}`}
        description={`Enter password to access ${protectedModalItem?.name || "this section"}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {menuVerifyError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{menuVerifyError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Admin Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showMenuPassword ? "text" : "password"}
                value={menuPasswordInput}
                onChange={(e) => setMenuPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleVerifyMenuPassword();
                  }
                }}
                placeholder="Enter password"
                autoFocus
                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowMenuPassword(!showMenuPassword)}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showMenuPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProtectedModalItem(null)}
              disabled={menuVerifyLoading}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVerifyMenuPassword}
              disabled={menuVerifyLoading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {menuVerifyLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify & Open</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
