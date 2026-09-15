"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const MONTHS_DATA = [
  { month: "January", customer: 1350, guest: 350 },
  { month: "February", customer: 750, guest: 320 },
  { month: "March", customer: 1150, guest: 520 },
  { month: "April", customer: 1080, guest: 380 },
  { month: "May", customer: 1380, guest: 380 },
  { month: "June", customer: 1280, guest: 1020 },
  { month: "July", customer: 1080, guest: 1180 },
  { month: "August", customer: 0, guest: 0 },
  { month: "September", customer: 0, guest: 0 },
  { month: "October", customer: 0, guest: 0 },
  { month: "November", customer: 0, guest: 0 },
  { month: "December", customer: 0, guest: 0 },
];

export default function CustomerReportsPage() {
  const [filterTab, setFilterTab] = useState("year");
  const [dateInput, setDateInput] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const handleExport = () => {
    const headers = "Month,Customer Orders,Guest Orders,Total Orders\n";
    const rows = MONTHS_DATA.map(
      (d) =>
        `"${d.month}","${d.customer}","${d.guest}","${d.customer + d.guest}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customer_Reports_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Breadcrumbs matching screenshot */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-900">
              Customer Reports
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link
                href="/dashboard"
                className="text-emerald-600 hover:text-emerald-700 font-normal transition"
              >
                Home
              </Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-500">Customer Reports</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleExport}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#00a859] hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar matching screenshot */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { id: "year", label: "Year" },
                { id: "last-month", label: "Last month" },
                { id: "this-month", label: "This month" },
                { id: "seven-day", label: "Last 7 days" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterTab === tab.id
                      ? "bg-[#00a859] text-white shadow-2xs"
                      : "bg-[#f1f5f9] hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Date Input */}
            <div>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs font-medium"
              />
            </div>

            {/* Generate Button */}
            <div>
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-[#00a859] hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* ROW 1: 4-Column Donut Card & 8-Column Stacked Bar Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1 (4 cols): 12440 orders Donut Chart */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-[#00a859] rounded-full" />
              <h3 className="font-bold text-sm text-slate-900">
                12440 orders
              </h3>
            </div>

            {/* Perfect Full 360-degree Donut (66% Green + 34% Gold) */}
            <div className="flex items-center justify-center gap-6 py-6 my-auto">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Green Customer Segment (66%) - Circumference for r=42 is 263.89 */}
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#00a859"
                    strokeWidth="18"
                    strokeDasharray="174.17 263.89"
                    strokeDashoffset="0"
                  />
                  {/* Gold Guest Segment (34%) */}
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#f4b41a"
                    strokeWidth="18"
                    strokeDasharray="89.72 263.89"
                    strokeDashoffset="-174.17"
                  />
                </svg>

                {/* Percentage Labels directly on the donut matching first image */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[11px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] absolute right-6 bottom-16">
                    66.0%
                  </span>
                  <span className="text-[11px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] absolute left-6 top-16">
                    34.0%
                  </span>
                </div>
              </div>

              {/* Legend on the Right */}
              <div className="space-y-2.5 text-xs shrink-0">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#00a859] inline-block shadow-2xs" />
                  <span>Customer</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#f4b41a] inline-block shadow-2xs" />
                  <span>Guest</span>
                </div>
              </div>
            </div>

            <div />
          </div>

          {/* Card 2 (8 cols): Customer order Vs Guest order (Full SVG Stacked Bar Chart) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-2 pb-2">
              <span className="w-1 h-5 bg-[#00a859] rounded-full" />
              <h3 className="font-bold text-sm text-slate-900">
                Customer order Vs Guest order
              </h3>
            </div>

            {/* Mathematically Exact SVG Stacked Bar Chart */}
            <div className="w-full">
              <svg
                viewBox="0 0 900 280"
                className="w-full h-auto"
                style={{ minHeight: "230px" }}
              >
                {/* Horizontal Dashed Grid Lines & Y-Axis Labels */}
                {[
                  { val: 2400, y: 30 },
                  { val: 1800, y: 75 },
                  { val: 1200, y: 120 },
                  { val: 600, y: 165 },
                  { val: 0, y: 210 },
                ].map((g) => (
                  <g key={g.val}>
                    <text
                      x="40"
                      y={g.y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#64748b"
                      fontFamily="sans-serif"
                    >
                      {g.val}
                    </text>
                    <line
                      x1="52"
                      y1={g.y}
                      x2="880"
                      y2={g.y}
                      stroke="#e2e8f0"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* 12 Stacked Bars and Aligned Month Labels */}
                {MONTHS_DATA.map((item, idx) => {
                  const startX = 60;
                  const stepX = 68;
                  const barWidth = 34;
                  const x = startX + idx * stepX;
                  const centerX = x + barWidth / 2;

                  const maxVal = 2400;
                  const maxHeight = 180; // from y=30 to y=210
                  const baseY = 210;

                  const cHeight = (item.customer / maxVal) * maxHeight;
                  const gHeight = (item.guest / maxVal) * maxHeight;

                  const cY = baseY - cHeight;
                  const gY = cY - gHeight;

                  return (
                    <g key={item.month} className="group cursor-pointer">
                      {/* Bottom Customer Bar (Green) */}
                      {item.customer > 0 && (
                        <rect
                          x={x}
                          y={cY}
                          width={barWidth}
                          height={cHeight}
                          fill="#00a859"
                        />
                      )}

                      {/* Top Guest Bar (Gold) */}
                      {item.guest > 0 && (
                        <rect
                          x={x}
                          y={gY}
                          width={barWidth}
                          height={gHeight}
                          fill="#f4b41a"
                        />
                      )}

                      {/* Month Text Label below the baseline */}
                      <text
                        x={centerX}
                        y="232"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#475569"
                        fontWeight="500"
                        fontFamily="sans-serif"
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}

                {/* Centered Months Label */}
                <text
                  x="466"
                  y="262"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#0f172a"
                  fontFamily="sans-serif"
                >
                  Months
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* ROW 2: Customer Vs Guest (Full SVG Smooth Dual Area Wave Chart) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-[#00a859] rounded-full" />
            <h3 className="font-bold text-sm text-slate-900">
              Customer Vs Guest
            </h3>
          </div>

          {/* Mathematically Exact SVG Wave Chart */}
          <div className="w-full">
            <svg
              viewBox="0 0 900 280"
              className="w-full h-auto"
              style={{ minHeight: "230px" }}
            >
              <defs>
                {/* Yellow Area Gradient */}
                <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4b41a" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f4b41a" stopOpacity="0.02" />
                </linearGradient>

                {/* Green Area Gradient */}
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00a859" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#00a859" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Dashed Grid Lines & Y-Axis Labels */}
              {[
                { val: 1200, y: 30 },
                { val: 800, y: 90 },
                { val: 400, y: 150 },
                { val: 0, y: 210 },
              ].map((g) => (
                <g key={g.val}>
                  <text
                    x="40"
                    y={g.y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#64748b"
                    fontFamily="sans-serif"
                  >
                    {g.val}
                  </text>
                  <line
                    x1="52"
                    y1={g.y}
                    x2="880"
                    y2={g.y}
                    stroke="#e2e8f0"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Top Yellow Curve Area (Guest / Total Curve) */}
              <path
                d="M 60 195 Q 140 198, 200 178 T 340 182 T 410 135 T 480 80 T 545 65 T 600 210 L 880 210 L 880 210 L 60 210 Z"
                fill="url(#yellowGradient)"
              />
              <path
                d="M 60 195 Q 140 198, 200 178 T 340 182 T 410 135 T 480 80 T 545 65 T 600 210 L 880 210"
                fill="none"
                stroke="#f4b41a"
                strokeWidth="2.5"
              />

              {/* Bottom Green Curve Area (Customer Curve) */}
              <path
                d="M 60 205 Q 140 205, 200 195 T 340 198 T 410 180 T 480 145 T 545 135 T 600 210 L 880 210 L 880 210 L 60 210 Z"
                fill="url(#greenGradient)"
              />
              <path
                d="M 60 205 Q 140 205, 200 195 T 340 198 T 410 180 T 480 145 T 545 135 T 600 210 L 880 210"
                fill="none"
                stroke="#00a859"
                strokeWidth="2.5"
              />

              {/* 12 Aligned Month Labels */}
              {MONTHS_DATA.map((item, idx) => {
                const startX = 60;
                const stepX = 68;
                const barWidth = 34;
                const x = startX + idx * stepX;
                const centerX = x + barWidth / 2;

                return (
                  <text
                    key={item.month}
                    x={centerX}
                    y="232"
                    textAnchor="middle"
                    fontSize="10"
                    fill="#475569"
                    fontWeight="500"
                    fontFamily="sans-serif"
                  >
                    {item.month}
                  </text>
                );
              })}

              {/* Centered Days Label */}
              <text
                x="466"
                y="262"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#0f172a"
                fontFamily="sans-serif"
              >
                Days
              </text>
            </svg>
          </div>
        </div>

        {/* Footer matching screenshot */}
        <div className="text-left text-xs text-slate-500 pt-2">
          2026 Copyright © Meetay
        </div>
      </div>
    </AppLayout>
  );
}
