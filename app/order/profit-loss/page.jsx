"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

function ProfitLossContent() {
  const searchParams = useSearchParams();
  const initialYear = Number(searchParams.get("year")) || 2026;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [activeYear, setActiveYear] = useState(initialYear);

  const [profitLossData, setProfitLossData] = useState({
    year: String(initialYear),
    yearArray: [2025, 2026, 2027, 2028, 2029, 2030],
    totalAmount: [],
  });

  const [loading, setLoading] = useState(true);

  const loadData = async (yearToFetch) => {
    setLoading(true);
    const res = await api.getOnlineSaleProfitLoss({ year: yearToFetch });
    if (res && res.status === "success") {
      setProfitLossData(res);
    } else {
      setProfitLossData({
        year: String(yearToFetch),
        yearArray: [2025, 2026, 2027, 2028, 2029, 2030],
        totalAmount: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(activeYear);
  }, [activeYear]);

  const handleSubmitYear = (e) => {
    e.preventDefault();
    setActiveYear(selectedYear);
  };

  const yearOptions = profitLossData.yearArray || [2025, 2026, 2027, 2028, 2029, 2030];
  const monthlyList = profitLossData.totalAmount || [];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Breadcrumb & Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Profit Loss</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <Link href="/order" className="text-emerald-600 hover:underline">
                Order
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Profit Loss</span>
            </div>
          </div>
        </div>

        {/* Container Card */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          {/* Top Year Filter Row */}
          <form onSubmit={handleSubmitYear} className="flex items-center justify-end gap-2 pb-2">
            <div className="w-36">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs font-medium cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit</span>
            </button>
          </form>

          {/* Table matching exact columns */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Sl.No</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Sale</th>
                  <th className="py-3 px-4">Profit</th>
                  <th className="py-3 px-4">Tax</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">NET</th>
                  <th className="py-3 px-4 text-center w-20">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-6"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-10 mx-auto"></div></td>
                    </tr>
                  ))
                ) : monthlyList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      No profit loss data available for {activeYear}.
                    </td>
                  </tr>
                ) : (
                  monthlyList.map((row, idx) => {
                    const saleVal = row.salePrice ?? row.sale ?? 0;
                    const profitVal = row.profit ?? 0;
                    const netVal = row.Net ?? row.net ?? 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-500">
                          {row.month_number || idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {row.MonthName}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {saleVal > 0 ? `₹ ${saleVal.toLocaleString()}` : "0"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          {profitVal > 0 ? `₹ ${profitVal.toLocaleString()}` : "0"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {row.taxPrice ?? row.tax ?? 0}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {row.discountPrice ?? row.discount ?? 0}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {netVal > 0 ? `₹ ${netVal.toLocaleString()}` : "0"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/order/profit-loss/month?year=${activeYear}&month=${row.month_number || idx + 1}`}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 hover:underline font-bold"
                          >
                            <span>view</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function ProfitLossPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading...</div>}>
      <ProfitLossContent />
    </Suspense>
  );
}
