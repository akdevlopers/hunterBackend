"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Printer, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

// High-precision Code 128 (Subset B) Barcode Pattern Table for fallback rendering
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function generateCode128Bars(text) {
  if (!text) return [];
  const str = String(text).trim();
  if (!str) return [];

  const codes = [104];
  let checksum = 104;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    let code = charCode - 32;
    if (code < 0 || code > 95) code = 0;
    codes.push(code);
    checksum += code * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(106);

  let patternStr = "";
  for (const c of codes) {
    patternStr += CODE128_PATTERNS[c] || "212222";
  }

  const bars = [];
  let isBar = true;
  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10) || 1;
    bars.push({ isBar, width });
    isBar = !isBar;
  }
  return bars;
}

function BarcodeSVG({ value, height = 30, className = "" }) {
  const bars = useMemo(() => generateCode128Bars(value), [value]);
  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  let currentX = 0;
  return (
    <svg
      viewBox={`0 0 ${Math.max(totalWidth, 10)} ${height}`}
      className={`w-44 h-7 ${className}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {bars.map((bar, idx) => {
        const x = currentX;
        currentX += bar.width;
        if (!bar.isBar) return null;
        return (
          <rect
            key={idx}
            x={x}
            y={0}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        );
      })}
    </svg>
  );
}

export default function BatchLabelPrintPage() {
  const [fromSku, setFromSku] = useState("");
  const [toSku, setToSku] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [barcodeList, setBarcodeList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClear = () => {
    setFromSku("");
    setToSku("");
    setQuantity("1");
    setBarcodeList([]);
    setErrorMsg("");
  };

  const handleGenerateAndPrint = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg("");

    const fromVal = fromSku.trim();
    const toVal = toSku.trim() || fromVal;
    const qtyVal = Math.max(1, parseInt(quantity, 10) || 1);

    if (!fromVal && !toVal) {
      setErrorMsg("Please enter at least a 'From SKU'.");
      return;
    }

    setLoading(true);

    try {
      // Call Live Barcode API: /admin/products/barcode
      const list = await api.getBarcodeList({
        fromSku: fromVal,
        toSku: toVal,
        qty: qtyVal,
      });

      if (Array.isArray(list) && list.length > 0) {
        setBarcodeList(list);
        // Trigger Print Dialog
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        setBarcodeList([]);
        setErrorMsg("No barcode data found for the specified SKUs.");
      }
    } catch (err) {
      console.error("Barcode API Error:", err);
      setErrorMsg("Failed to fetch barcode list from server.");
    } finally {
      setLoading(false);
    }
  };

  // Group barcode list into rows of 2 (pairs) for table rendering matching PHP template
  const tableRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < barcodeList.length; i += 2) {
      rows.push([barcodeList[i], barcodeList[i + 1] || null]);
    }
    return rows;
  }, [barcodeList]);

  return (
    <AppLayout>
      <div className="space-y-6 print:m-0 print:p-0 print:space-y-0">
        {/* Top Header Breadcrumb matching Screenshot */}
        <div className="space-y-0.5 print:hidden">
          <h1 className="text-xl font-bold text-slate-900">Product</h1>
          <div className="text-xs">
            <Link href="/dashboard" className="text-emerald-600 hover:underline font-normal">
              Home
            </Link>
          </div>
        </div>

        {/* Batch Label Print Form Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 print:hidden">
          <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
            Batch Label Print
          </h2>

          <form onSubmit={handleGenerateAndPrint} className="max-w-xl space-y-4">
            {/* From SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
              <label htmlFor="fromSku" className="text-xs font-bold text-slate-800">
                From SKU
              </label>
              <input
                id="fromSku"
                type="text"
                value={fromSku}
                onChange={(e) => setFromSku(e.target.value)}
                placeholder="e.g. 1001"
                className="w-full sm:max-w-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* To SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
              <label htmlFor="toSku" className="text-xs font-bold text-slate-800">
                To SKU
              </label>
              <input
                id="toSku"
                type="text"
                value={toSku}
                onChange={(e) => setToSku(e.target.value)}
                placeholder="e.g. 1002"
                className="w-full sm:max-w-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
              <label htmlFor="qty" className="text-xs font-bold text-slate-800">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="qty"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-24 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500">(per SKU)</span>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons matching screenshot */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition cursor-pointer"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{loading ? "Calling API..." : "Print"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Barcode Sheet Preview on Screen */}
        {barcodeList.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Print Preview ({barcodeList.length} Labels)
                </h3>
                <p className="text-[11px] text-slate-500">
                  PHP Table Template Format with 2-column layout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Barcode</span>
              </button>
            </div>

            {/* Table layout matching PHP template */}
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-xs border border-slate-100">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {tableRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((item, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              width: "50%",
                              height: "100px",
                              paddingLeft: "26px",
                              paddingBottom: "18px",
                              verticalAlign: "top",
                            }}
                          >
                            {item && (
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                                  ₹ {item.rate ?? item.price ?? ""}
                                </div>

                                <div style={{ margin: "2px 0" }}>
                                  {item.barcode ? (
                                    <img
                                      src={
                                        item.barcode.startsWith("data:")
                                          ? item.barcode
                                          : `data:image/png;base64,${item.barcode}`
                                      }
                                      alt={String(item.sku || "")}
                                      style={{ display: "block", maxHeight: "35px" }}
                                    />
                                  ) : (
                                    <BarcodeSVG value={item.sku} height={30} className="w-44 h-7" />
                                  )}
                                </div>

                                <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                                  {item.sku}
                                </div>

                                <div style={{ fontSize: "10px", lineHeight: "1.25" }}>
                                  {item.name}
                                  <br />
                                  {item.size || item.variant || ""}
                                  <br />
                                  Hunter Menswear Kanyakumari.
                                </div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRINT ONLY CONTAINER - Exact HTML Table matching PHP Code */}
        <div id="print-barcode-sheet" className="hidden print:block">
          <style jsx global>{`
            @media print {
              @page {
                size: auto;
                margin: 0;
              }
              html, body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: Arial, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              header, nav, aside, .sidebar, .navbar, .print\\:hidden {
                display: none !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                visibility: hidden !important;
              }
              #print-barcode-sheet {
                display: block !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                padding-top: 10px !important;
              }
              p.inline { display: inline-block; }
              span { font-size: 13px; }
              div.b128 { border-left: 1px black solid; height: 20px; }
            }
          `}</style>

          <table width="100%" style={{ width: "100%", borderCollapse: "collapse", margin: 0, padding: 0 }}>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  <tr>
                    {row.map((item, cIdx) => (
                      <td
                        key={cIdx}
                        width="50%"
                        height="100"
                        style={{
                          width: "50%",
                          height: "100px",
                          paddingLeft: "26px",
                          paddingBottom: "14px",
                          verticalAlign: "top",
                        }}
                      >
                        {item && (
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "normal" }}>
                              ₹ {item.rate ?? item.price ?? ""}
                            </div>

                            <div style={{ margin: "2px 0" }}>
                              {item.barcode ? (
                                <img
                                  src={
                                    item.barcode.startsWith("data:")
                                      ? item.barcode
                                      : `data:image/png;base64,${item.barcode}`
                                  }
                                  alt={String(item.sku || "")}
                                  style={{ display: "block", maxHeight: "35px" }}
                                />
                              ) : (
                                <BarcodeSVG value={item.sku} height={30} className="w-44 h-7" />
                              )}
                            </div>

                            <div style={{ fontSize: "12px", fontWeight: "normal" }}>
                              {item.sku}
                            </div>

                            <div style={{ fontSize: "10px", lineHeight: "1.25" }}>
                              {item.name}
                              <br />
                              {item.size || item.variant || ""}
                              <br />
                              Hunter Menswear Kanyakumari.
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
