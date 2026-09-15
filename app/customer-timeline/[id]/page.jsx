"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  Mail,
  Receipt,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

export default function CustomerTimelinePage() {
  const routeParams = useParams();
  const customerId = routeParams?.id || "3958";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await api.getCustomerTimeline(customerId);
      if (res && (res.customer || res.timeline || res.data)) {
        setData(res);
      } else {
        // Fallback to fetch single customer details
        const cust = await api.getCustomerById(customerId);
        setData({ customer: cust, timeline: [] });
      }
      setLoading(false);
    }
    loadData();
  }, [customerId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-medium">Loading customer timeline...</p>
        </div>
      </AppLayout>
    );
  }

  const customer = data?.customer || data || {};
  const timelineList = data?.timeline || data?.data || [];

  const fullName = customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Customer";
  const firstName = customer.first_name || fullName.split(" ")[0] || "Customer";
  const email = customer.email || "No email";
  const totalSpend = customer.total_spend ? Number(customer.total_spend).toFixed(2) : "0.00";
  const ordersCount = customer.orders_count ?? 0;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header & Breadcrumbs matching user screenshot */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Customer Timeline
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Link href="/dashboard" className="text-emerald-600 hover:underline">
              Home
            </Link>
            <span>&gt;</span>
            <Link href="/customer" className="text-emerald-600 hover:underline">
              Customer
            </Link>
            <span>&gt;</span>
            <span className="text-slate-500 font-medium">{firstName}</span>
          </div>
        </div>

        {/* 4 Top Metric Cards Grid matching exact layout in screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Customer Name */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600 block">
                Customer Name
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                {fullName}
              </h3>
            </div>
          </div>

          {/* Card 2: Customer Email */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1 w-full overflow-hidden">
              <span className="text-xs font-semibold text-slate-600 block">
                Customer Email
              </span>
              <h3 className="text-xs font-bold text-slate-900 break-all leading-snug">
                {email}
              </h3>
            </div>
          </div>

          {/* Card 3: Total Spend */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600 block">
                Total Spend
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                {totalSpend}
              </h3>
            </div>
          </div>

          {/* Card 4: Total Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600 block">
                Total Orders
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                {ordersCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Vertical Alternating Timeline Tree Section */}
        {timelineList.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800">
              User {firstName} has no activity history recorded.
            </h2>
            <p className="text-xs text-slate-400">Cart updates, orders and page views will appear on this timeline.</p>
          </div>
        ) : (
          <div className="relative py-8">
            {/* Center Vertical Spine Line */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-slate-200" />

            <div className="space-y-10">
              {timelineList.map((item, index) => {
                const isRight = index % 2 === 0;

                return (
                  <div
                    key={item.id || index}
                    className="relative flex items-center justify-between"
                  >
                    {/* Node Dot on Central Line */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-300 z-10" />

                    {/* Timeline Box Container */}
                    <div
                      className={`w-full lg:w-[46%] ${
                        isRight ? "lg:ml-auto" : "lg:mr-auto"
                      }`}
                    >
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3 relative">
                        {/* Connector Line from Dot to Box */}
                        <div
                          className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-8 h-0.5 bg-slate-200 ${
                            isRight ? "-left-8" : "-right-8"
                          }`}
                        />

                        {/* Top Action Badge */}
                        <div className={`flex items-center ${isRight ? "justify-start" : "justify-end"}`}>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{item.action || item.title || "cart activity"}</span>
                          </span>
                        </div>

                        {/* Product & Variant Details */}
                        <div className="space-y-2 text-xs pt-1">
                          {item.product_name && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-700">Product:-</span>
                              <span className="bg-rose-500 text-white font-medium px-2 py-0.5 rounded text-[11px]">
                                {item.product_name}
                              </span>
                            </div>
                          )}

                          {item.variant && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-700">Variant:-</span>
                              <span className="bg-amber-900 text-white font-medium px-1.5 py-0.5 rounded text-[11px]">
                                {item.variant}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Timestamp in corner */}
                        {item.timestamp && (
                          <div className="text-right pt-1">
                            <span className="text-[11px] font-medium text-slate-400">
                              {item.timestamp}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Notice */}
        <div className="pt-12 text-xs text-slate-400">
          2026 Copyright © Meetay
        </div>
      </div>
    </AppLayout>
  );
}
