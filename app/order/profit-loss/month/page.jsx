"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

function ProfitLossMonthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlYear = searchParams.get("year") || new Date().getFullYear().toString();
  const urlMonth = searchParams.get("month") || (new Date().getMonth() + 1).toString();

  const padMonth = urlMonth.padStart(2, "0");
  const [yearMonthInput, setYearMonthInput] = useState(`${urlYear}-${padMonth}`);
  const [currentYear, setCurrentYear] = useState(urlYear);
  const [currentMonth, setCurrentMonth] = useState(urlMonth);

  const [monthData, setMonthData] = useState({
    year: urlYear,
    month: padMonth,
    month_name: "",
    totalAmount: [],
    allDatesArray: [],
  });
  const [loading, setLoading] = useState(true);

  const loadMonthData = async (y, m) => {
    setLoading(true);
    const res = await api.getOnlineSaleProfitLossMonth({ year: y, month: m });
    if (res && res.status === "success") {
      setMonthData(res);
    } else {
      setMonthData({
        year: y,
        month: m,
        month_name: "",
        totalAmount: [],
        allDatesArray: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMonthData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const y = searchParams.get("year");
    const m = searchParams.get("month");
    if (y) setCurrentYear(y);
    if (m) {
      setCurrentMonth(m);
      setYearMonthInput(`${y || urlYear}-${m.padStart(2, "0")}`);
    }
  }, [searchParams]);

  const handleDateChange = (e) => {
    const val = e.target.value; // e.g. "2026-02"
    setYearMonthInput(val);
    if (val) {
      const [y, m] = val.split("-");
      setCurrentYear(y);
      setCurrentMonth(parseInt(m, 10).toString());
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (yearMonthInput) {
      const [y, m] = yearMonthInput.split("-");
      const mNum = parseInt(m, 10);
      setCurrentYear(y);
      setCurrentMonth(mNum.toString());
      router.push(`/online_sale_profit_loss_month?year=${y}&month=${mNum}`);
    }
  };

  const dailyRows = monthData.totalAmount || [];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/profit-loss"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Daily Profit &amp; Loss Breakdown
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
                <span className="text-slate-600 font-medium">
                  Month ({monthData.month_name || yearMonthInput})
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              type="month"
              value={yearMonthInput}
              onChange={handleDateChange}
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

        {/* Daily Breakdown Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-3 w-14 text-center">Sl.No</th>
                  <th className="py-3 px-3 w-32">Date</th>
                  <th className="py-3 px-3">Sale</th>
                  <th className="py-3 px-3">Total Profit</th>
                  <th className="py-3 px-3">Tax</th>
                  <th className="py-3 px-3">Expense</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">NET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3 px-3 text-center"><div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                      <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : dailyRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      No profit loss data recorded for this month.
                    </td>
                  </tr>
                ) : (
                  dailyRows.map((row, idx) => {
                    const saleVal = row.salePrice ?? row.sale ?? 0;
                    const profitVal = row.profit ?? 0;
                    const netVal = row.Net ?? row.net ?? 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 text-center font-medium text-slate-400">
                          {row.day || idx + 1}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                          {row.date || row.MonthName}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {saleVal > 0 ? `₹ ${saleVal.toLocaleString()}` : "0"}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          {profitVal > 0 ? `₹ ${profitVal.toLocaleString()}` : "0"}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {row.taxPrice ?? row.tax ?? 0}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {row.expense ?? 0}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {row.discountPrice ?? row.discount ?? 0}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {netVal > 0 ? `₹ ${netVal.toLocaleString()}` : "0"}
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
