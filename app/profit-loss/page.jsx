"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

function ProfitLossContent() {
  const searchParams = useSearchParams();
  const initialYear = Number(searchParams.get("year")) || 2026;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [activeYear, setActiveYear] = useState(initialYear);

  const [profitLossData, setProfitLossData] = useState({
    year: initialYear,
    yearArray: [2025, 2026, 2027, 2028, 2029, 2030],
    data: [],
  });

  const [loading, setLoading] = useState(true);

  const loadData = async (yearToFetch) => {
    setLoading(true);
    const res = await api.getPosProfitLoss({ year: yearToFetch });
    if (res && (res.status === "success" || res.data)) {
      setProfitLossData({
        year: res.year || yearToFetch,
        yearArray: res.yearArray || [2025, 2026, 2027, 2028, 2029, 2030],
        data: res.data || [],
      });
    } else {
      setProfitLossData({
        year: yearToFetch,
        yearArray: [2025, 2026, 2027, 2028, 2029, 2030],
        data: [],
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
  const monthlyList = profitLossData.data || [];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Profit & Loss</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Sales</span>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Profit Loss</span>
            </div>
          </div>

          {/* Year Filter Form */}
          <form onSubmit={handleSubmitYear} className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit</span>
            </button>
          </form>
        </div>

        {/* Master Table matching pos/profit_loss.blade.php */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-14 text-center">Sl.No</th>
                  <th className="py-3.5 px-3 w-32">Month</th>
                  <th className="py-3.5 px-3 text-right">Sale</th>
                  <th className="py-3.5 px-3 text-right">Total Profit</th>
                  <th className="py-3.5 px-3 text-right">Tax</th>
                  <th className="py-3.5 px-3 text-right">Expense</th>
                  <th className="py-3.5 px-3 text-right">Discount</th>
                  <th className="py-3.5 px-3 text-right">NET Profit</th>
                  <th className="py-3.5 px-3 text-center w-20">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-3 text-center"><div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div></td>
                      <td className="py-3.5 px-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      <td className="py-3.5 px-3 text-center"><div className="h-4 bg-slate-200 rounded w-10 mx-auto"></div></td>
                    </tr>
                  ))
                ) : monthlyList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                      No profit & loss data available for {activeYear}.
                    </td>
                  </tr>
                ) : (
                  monthlyList.map((row, idx) => {
                    const saleVal = Number(row.salePrice || 0);
                    const profitVal = Number(row.profit || 0);
                    const taxVal = Number(row.taxPrice || 0);
                    const expenseVal = Number(row.expense || 0);
                    const discountVal = Number(row.discountPrice || 0);
                    const netVal = Number(row.Net || 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                          {row.month || idx + 1}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {row.MonthName}
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-slate-800">
                          ₹ {saleVal.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                          ₹ {netVal.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-600">
                          ₹ {taxVal.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right text-rose-600">
                          ₹ {expenseVal.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-600">
                          ₹ {discountVal.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                          ₹ {profitVal.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <Link
                            href={`/profit-loss-month?year=${activeYear}&month=${row.month || idx + 1}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            <span>view</span>
                            <ArrowRight className="w-3 h-3" />
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

export default function SalesProfitLossPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading...</div>}>
      <ProfitLossContent />
    </Suspense>
  );
}
