"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from "lucide-react";

function parseTerms(terms) {
  if (Array.isArray(terms)) {
    return terms.map((t) => (typeof t === "object" ? (t.name || t.value || t.term) : String(t)));
  }
  if (typeof terms === "string") {
    const matches = Array.from(terms.matchAll(/<span[^>]*>(.*?)<\/span>/gi))
      .map((m) => m[1].trim())
      .filter(Boolean);
    if (matches.length > 0) return matches;
  }
  return [];
}

export function AttributeTable({
  attributes = [],
  loading = false,
  onEdit,
  onDelete,
  onConfigureTerms,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


  const handleReset = () => {
    setSearch("");
    setPage(1);
  };

  const filtered = attributes.filter((attr) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return attr.name?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Search Toolbar matching Meetay */}
      <div className="flex items-center justify-end gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search attributes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-56 sm:w-72 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Green Search Action Button */}
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer shrink-0"
          title="Search"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Pink Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer shrink-0"
          title="Reset Search"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-2xs cursor-pointer shrink-0"
          title="Refresh Attributes"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Container matching Meetay ProductAttributeDataTable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-slate-50/90 border-y border-slate-200 text-xs font-bold text-slate-800 tracking-wider">
              <th className="py-3 px-4 w-16">Sl/No</th>
              <th className="py-3 px-4 w-32">Name</th>
              <th className="py-3 px-4">TERMS</th>
              <th className="py-3 px-4 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-6"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 bg-slate-200 rounded-full w-10"></div>
                      <div className="h-6 bg-slate-200 rounded-full w-14"></div>
                      <div className="h-6 bg-slate-200 rounded-full w-12"></div>
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-1.5">
                      <div className="h-7 w-7 bg-slate-200 rounded-md"></div>
                      <div className="h-7 w-7 bg-slate-200 rounded-md"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No matching attributes found.
                </td>
              </tr>
            ) : (

              paginated.map((attribute, index) => {
                const globalIndex = (page - 1) * pageSize + index + 1;
                const termsList = parseTerms(attribute.terms || attribute.values || attribute.attribute_values);

                return (
                  <tr key={attribute.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Index */}
                    <td className="py-3.5 px-4 align-middle font-medium text-slate-400">
                      {globalIndex}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 align-middle font-semibold text-slate-900">
                      {attribute.name}
                    </td>

                    {/* Terms */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {termsList.map((label, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#00B074] text-white shadow-2xs"
                          >
                            {label}
                          </span>
                        ))}

                        <Link
                          href={`/attribute-option/${attribute.id}`}
                          className="text-[#00B074] hover:underline text-xs font-bold ml-1.5 cursor-pointer whitespace-nowrap"
                        >
                          Configure terms
                        </Link>
                      </div>
                    </td>




                    {/* Action */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Green Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(attribute)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Pink Delete Button */}
                        {/* <button
                          type="button"
                          onClick={() => onDelete(attribute.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Full Interactive Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer font-medium"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setPage(pageNum)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition cursor-pointer ${
                page === pageNum
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

