"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

function ProfitLossMonthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialYear = Number(searchParams.get("year")) || 2026;
  const initialMonth = Number(searchParams.get("month")) || 9;

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const [monthInput, setMonthInput] = useState(
    `${initialYear}-${String(initialMonth).padStart(2, "0")}`
  );

  const [monthData, setMonthData] = useState({
    year: initialYear,
    month: initialMonth,
    daysInMonth: 30,
    data: [],
  });

  const [loading, setLoading] = useState(true);

  const loadData = async (targetYear, targetMonth) => {
    setLoading(true);
    const res = await api.getPosProfitLossMonth({
      year: targetYear,
      month: targetMonth,
    });
    if (res && (res.status === "success" || res.data)) {
      setMonthData({
        year: res.year || targetYear,
        month: res.month || targetMonth,
        daysInMonth: res.daysInMonth || 30,
        data: res.data || [],
      });
    } else {
      setMonthData({
        year: targetYear,
        month: targetMonth,
        daysInMonth: 30,
        data: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(year, month);
  }, [year, month]);

  const handleMonthInputSubmit = (e) => {
    e.preventDefault();
    if (!monthInput) return;
    const parts = monthInput.split("-");
    if (parts.length === 2) {
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      setYear(y);
      setMonth(m);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/profit-loss?year=${year}`);
    }
  };

  const daysList = monthData.data || [];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Daily Profit &amp; Loss Breakdown</span>
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <Link href="/dashboard" className="text-emerald-600 hover:underline">
                  Home
                </Link>
                <span>&gt;</span>
                <Link href="/profit-loss" className="text-emerald-600 hover:underline">
                  Profit Loss
                </Link>
                <span>&gt;</span>
                <span className="text-slate-600 font-medium">Month ({monthInput})</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleMonthInputSubmit} className="flex items-center gap-2">
            <input
              type="month"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Submit</span>
            </button>
          </form>
        </div>

        {/* Daily Breakdown Table matching pos/profitlossmonth API */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-14 text-center">Sl.No</th>
                  <th className="py-3.5 px-4 w-32">Date</th>
                  <th className="py-3.5 px-4 text-right">Sale</th>
                  <th className="py-3.5 px-4 text-right">Total Profit</th>
                  <th className="py-3.5 px-4 text-right">Tax</th>
                  <th className="py-3.5 px-4 text-right">Expense</th>
                  <th className="py-3.5 px-4 text-right">Discount</th>
                  <th className="py-3.5 px-4 text-right">NET Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : daysList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                      No daily breakdown available for this month.
                    </td>
                  </tr>
                ) : (
                  daysList.map((row, idx) => {
                    const saleVal = Number(row.salePrice || 0);
                    const profitVal = Number(row.profit || 0);
                    const taxVal = Number(row.taxPrice || 0);
                    const expenseVal = Number(row.expense || 0);
                    const discountVal = Number(row.discountPrice || 0);
                    const netVal = Number(row.Net || 0);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 text-center font-bold text-slate-500">
                          {row.day || idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                          {row.date || row.MonthName}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">
                          ₹ {saleVal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          ₹ {netVal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ₹ {taxVal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-600">
                          ₹ {expenseVal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          ₹ {discountVal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹ {profitVal.toFixed(2)}
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

export default function ProfitLossMonthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading...</div>}>
      <ProfitLossMonthContent />
    </Suspense>
  );
}
