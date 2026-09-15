"use client";

import React, { useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

const getCategoryImageUrl = (cat) => {
  if (!cat) return null;
  const raw = cat.image_url || cat.image_path || cat.image || cat.cover_image_url || cat.cover_image_path;
  if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "undefined" || raw === "null") return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `https://meetay.com/${trimmed}`;
};

const getCategoryIconUrl = (cat) => {
  if (!cat) return null;
  const raw = cat.icon_path || cat.icon_image || cat.icon_url || cat.icon;
  if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "undefined" || raw === "null") return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return `https://meetay.com/${trimmed}`;
};

export function CategoryTable({
  categories = [],
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleReset = () => {
    setSearch("");
    setPage(1);
  };

  // Filter logic
  const filtered = categories.filter((cat) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.parent_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Search Toolbar matching Meetay */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative flex-1 sm:flex-initial min-w-[160px] max-w-full">
          <input
            type="text"
            placeholder="Search category title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-64 md:w-72 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Green Search Action Button */}
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer shrink-0"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Container matching Meetay CategoryDataTable */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-50/90 border-y border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <th className="py-3 px-4 w-12">#</th>
              <th className="py-3 px-4">NAME</th>
              <th className="py-3 px-4">IMAGE</th>
              <th className="py-3 px-4">ICON</th>
              <th className="py-3 px-4">PARENT CATEGORY</th>
              <th className="py-3 px-4">TRENDING</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center w-24">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-5"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-36"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-11 h-11 bg-slate-200 rounded-lg"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-4 bg-slate-200 rounded w-8"></div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-5 bg-slate-200 rounded-full w-14"></div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-7 h-7 bg-slate-200 rounded-md"></div>
                      <div className="w-7 h-7 bg-slate-200 rounded-md"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No matching categories found.
                </td>
              </tr>
            ) : (
              paginated.map((category, index) => {
                const globalIndex = (page - 1) * pageSize + index + 1;
                const imgUrl = getCategoryImageUrl(category);
                const iconUrl = getCategoryIconUrl(category);

                return (
                  <tr key={category.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Index */}
                    <td className="py-3.5 px-4 align-middle font-medium text-slate-400">
                      {globalIndex}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 align-middle font-semibold text-slate-900">
                      {category.name}
                    </td>

                    {/* Image */}
                    <td className="py-3.5 px-4 align-middle">
                      {imgUrl ? (
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                          <img
                            src={imgUrl}
                            alt={category.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              if (e.target.parentElement) {
                                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke-width="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="1.5"/></svg></div>';
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      )}
                    </td>

                    {/* Icon */}
                    <td className="py-3.5 px-4 align-middle">
                      {iconUrl ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-0.5 shadow-2xs">
                          <img
                            src={iconUrl}
                            alt="Icon"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              if (e.target.parentElement) {
                                e.target.parentElement.innerHTML = '<div class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke-width="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="1.5"/></svg></div>';
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                        </div>
                      )}
                    </td>

                    {/* Parent Category */}
                    <td className="py-3.5 px-4 align-middle text-slate-600">
                      {category.parent_id === 0 ? "-" : category.parent_name}
                    </td>

                    {/* Trending */}
                    <td className="py-3.5 px-4 align-middle font-medium">
                      {category.trending === 1 ? "Yes" : "No"}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3.5 px-4 align-middle">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(category.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${category.status === 1
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-500 text-white"
                          }`}
                        title="Click to toggle status"
                      >
                        {category.status === 1 ? "Active" : "In-Active"}
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Green Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(category)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Pink Delete Button */}
                        <button
                          type="button"
                          onClick={() => onDelete(category.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filtered.length > pageSize && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-800">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
