"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  ShoppingCart,
  Users,
  Store,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopSalesWidget } from "@/components/dashboard/TopSalesWidget";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { StorageMeter } from "@/components/dashboard/StorageMeter";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getDashboardData();
        if (res) setData(res);
      } catch (e) {
        console.error("Dashboard load failed:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = data || {};
  const store = data?.store;
  const user = data?.users || data?.user;
  const recentOrders = data?.new_orders || data?.recent_orders || [];
  const topSellingProducts = data?.topSellingProducts || data?.top_categories || [];
  const latestProducts = data?.latests || data?.top_brands || [];

  return (
    <AppLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* 8 Order & Customer KPI Statistic Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Pending Orders"
              value={stats?.pending_order ?? 0}
              percentage={stats?.pendingOrderPer || "0%"}
              icon={Clock}
              iconColor="text-amber-500 bg-amber-500/10"
            />
            <StatCard
              label="Order Return"
              value={stats?.return_order ?? 0}
              percentage={stats?.returnOrderPer || "0%"}
              icon={RotateCcw}
              iconColor="text-rose-500 bg-rose-500/10"
            />
            <StatCard
              label="Confirmed Order"
              value={stats?.confirmed_order ?? 0}
              percentage={stats?.completeOrderPer || "0%"}
              icon={CheckCircle2}
              iconColor="text-blue-500 bg-blue-500/10"
            />
            <StatCard
              label="Cancel Order"
              value={stats?.cancel_order ?? 0}
              percentage={stats?.cancelOrderPer || "0%"}
              icon={XCircle}
              iconColor="text-red-500 bg-red-500/10"
            />
            <StatCard
              label="Order Shipped"
              value={stats?.shipped_order ?? 0}
              percentage={stats?.shippedOrderPer || "0%"}
              icon={Truck}
              iconColor="text-indigo-500 bg-indigo-500/10"
            />
            <StatCard
              label="Order Delivered"
              value={stats?.delivered_order ?? 0}
              percentage={stats?.deliveredOrderPer || "0%"}
              icon={PackageCheck}
              iconColor="text-emerald-500 bg-emerald-500/10"
            />
            <StatCard
              label="Total Orders"
              value={stats?.totle_order ?? 0}
              percentage={stats?.totalOrderPer || "0%"}
              icon={ShoppingCart}
              iconColor="text-purple-500 bg-purple-500/10"
            />
            <StatCard
              label="Total Customers"
              value={stats?.totle_customers ?? 0}
              percentage={stats?.customerPer || "0%"}
              icon={Users}
              iconColor="text-cyan-500 bg-cyan-500/10"
            />
          </div>

          {/* Main Section: Top selling Products + Latest Products + Storage Meter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <TopSalesWidget
                title="Top selling Products"
                type="top_selling"
                data={topSellingProducts}
              />
            </div>
            <div className="lg:col-span-1">
              <TopSalesWidget
                title="Latest Products"
                type="latest"
                data={latestProducts}
              />
            </div>
            <div className="lg:col-span-1">
              <StorageMeter
                usedMb={data?.storage_limit || 10.0}
                totalMb={250.0}
              />
            </div>
          </div>

          {/* Recent Orders Table */}
          <div>
            <RecentOrdersTable orders={recentOrders} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
