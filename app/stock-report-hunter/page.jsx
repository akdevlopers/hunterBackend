"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Boxes,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Package,
  FolderTree,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Tag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  ArrowRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

function formatINR(val) {
  const num = Number(val) || 0;
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getSafeImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

export default function StockReportHunterPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryPagination, setCategoryPagination] = useState(null);

  // Per-category loading state for pagination clicks
  const [categoryLoading, setCategoryLoading] = useState({});

  // Search & Filter state
  const [searchInput, setSearchInput] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all"); // 'all' | 'in_stock' | 'out_of_stock'
  const [viewMode, setViewMode] = useState("category"); // 'category' | 'flat'

  // Global category pagination state (default per page: 30)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Accordion state
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});

  // Fetch all categories report data
  const loadReportData = useCallback(
    async (page = currentPage, limit = pageSize, catId = selectedCategory, search = activeSearchQuery) => {
      setLoading(true);
      try {
        const payload = {
          page: Number(page) || 1,
          limit: Number(limit) || 30,
        };
        if (catId && catId !== "all") {
          payload.category_id = catId;
        }
        if (search) {
          payload.search = search;
        }

        const res = await api.getStockReportHunter(payload);
        const dataObj = res?.data || res || {};

        const categories = Array.isArray(dataObj.categories)
          ? dataObj.categories
          : Array.isArray(res?.categories)
          ? res.categories
          : [];

        const summary = dataObj.summary || res?.summary || null;
        const pagination =
          dataObj.category_pagination ||
          dataObj.pagination ||
          res?.category_pagination ||
          res?.pagination ||
          null;

        setCategoriesData(categories);
        setSummaryData(summary);
        setCategoryPagination(pagination);

        // Auto-expand all returned categories on load
        const initExpanded = {};
        categories.forEach((cat) => {
          initExpanded[cat.category_id] = true;
        });
        setExpandedCategories(initExpanded);
      } catch (err) {
        console.error("Failed to load stock report data:", err);
        setCategoriesData([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, selectedCategory, activeSearchQuery]
  );

  useEffect(() => {
    loadReportData(1, pageSize, "all", "");
  }, []);

  // Fetch more products for a specific category when category pagination is clicked
  const loadCategoryProducts = async (categoryId, targetPage) => {
    setCategoryLoading((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const res = await api.getStockReportHunter({
        category_id: categoryId,
        page: targetPage,
        limit: pageSize,
        search: activeSearchQuery,
      });

      const dataObj = res?.data || res || {};
      const returnedCategories = Array.isArray(dataObj.categories)
        ? dataObj.categories
        : Array.isArray(res?.categories)
        ? res.categories
        : [];

      const returnedCat =
        returnedCategories.find((c) => String(c.category_id) === String(categoryId)) ||
        returnedCategories[0] ||
        dataObj.category ||
        null;

      const newProducts =
        returnedCat?.products ||
        (Array.isArray(dataObj.products) ? dataObj.products : []) ||
        (Array.isArray(res?.products) ? res.products : []);

      const newProductPagination =
        returnedCat?.product_pagination ||
        dataObj.product_pagination ||
        res?.product_pagination ||
        null;

      setCategoriesData((prevCategories) => {
        return prevCategories.map((cat) => {
          if (String(cat.category_id) === String(categoryId)) {
            // Always append / merge new products with existing products
            const existingProducts = [...(cat.products || [])];
            newProducts.forEach((newP) => {
              const existingIndex = existingProducts.findIndex(
                (p) => String(p.product_id) === String(newP.product_id)
              );
              if (existingIndex >= 0) {
                existingProducts[existingIndex] = newP;
              } else {
                existingProducts.push(newP);
              }
            });

            return {
              ...cat,
              ...(returnedCat ? {
                category_name: returnedCat.category_name || cat.category_name,
                total_products: returnedCat.total_products ?? cat.total_products,
                total_variants: returnedCat.total_variants ?? cat.total_variants,
                total_stock: returnedCat.total_stock ?? cat.total_stock,
                category_purchase_value: returnedCat.category_purchase_value ?? cat.category_purchase_value,
                category_sale_value: returnedCat.category_sale_value ?? cat.category_sale_value,
                formatted_category_purchase_value: returnedCat.formatted_category_purchase_value || cat.formatted_category_purchase_value,
                formatted_category_sale_value: returnedCat.formatted_category_sale_value || cat.formatted_category_sale_value,
              } : {}),
              products: existingProducts,
              product_pagination: {
                ...(newProductPagination || {}),
                total_products: returnedCat?.total_products ?? cat.total_products ?? existingProducts.length,
                page: targetPage,
                limit: pageSize,
                total_pages:
                  newProductPagination?.total_pages ||
                  Math.ceil((returnedCat?.total_products ?? cat.total_products ?? existingProducts.length) / pageSize) ||
                  1,
                has_more:
                  targetPage <
                  (newProductPagination?.total_pages ||
                    Math.ceil((returnedCat?.total_products ?? cat.total_products ?? existingProducts.length) / pageSize)),
              },
            };
          }
          return cat;
        });
      });
    } catch (err) {
      console.error(`Failed to load products for category ${categoryId}:`, err);
    } finally {
      setCategoryLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // Search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    setActiveSearchQuery(query);
    setCurrentPage(1);
    loadReportData(1, pageSize, selectedCategory, query);
  };

  // Category selection change
  const handleCategorySelectChange = (e) => {
    const catId = e.target.value;
    setSelectedCategory(catId);
    setCurrentPage(1);
    loadReportData(1, pageSize, catId, activeSearchQuery);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput("");
    setActiveSearchQuery("");
    setSelectedCategory("all");
    setStockStatusFilter("all");
    setCurrentPage(1);
    loadReportData(1, pageSize, "all", "");
  };

  // Toggle single category accordion
  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Toggle single product variant table
  const toggleProductVariants = (prodId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [prodId]: !prev[prodId],
    }));
  };

  // Expand / Collapse all categories
  const handleToggleAllCategories = (expand) => {
    const nextState = {};
    categoriesData.forEach((c) => {
      nextState[c.category_id] = expand;
    });
    setExpandedCategories(nextState);
  };

  // Expand / Collapse all product variants
  const handleToggleAllVariants = (expand) => {
    const nextState = {};
    categoriesData.forEach((c) => {
      (c.products || []).forEach((p) => {
        nextState[p.product_id] = expand;
      });
    });
    setExpandedProducts(nextState);
  };

  // Filter categories and products based on user criteria
  const filteredCategories = useMemo(() => {
    const query = activeSearchQuery.toLowerCase();

    return categoriesData
      .map((cat) => {
        // Category filter check
        if (selectedCategory !== "all" && String(cat.category_id) !== String(selectedCategory)) {
          return null;
        }

        const rawProducts = Array.isArray(cat.products) ? cat.products : [];

        // Match products inside category
        const matchingProducts = rawProducts.filter((prod) => {
          // Stock Status filter
          if (stockStatusFilter === "in_stock" && (prod.total_stock <= 0 || prod.stock_status === "out_of_stock")) {
            return false;
          }
          if (stockStatusFilter === "out_of_stock" && prod.total_stock > 0 && prod.stock_status !== "out_of_stock") {
            return false;
          }

          if (!query) return true;

          // Check product fields
          const nameMatch = prod.product_name && prod.product_name.toLowerCase().includes(query);
          const skuMatch = prod.sku && String(prod.sku).toLowerCase().includes(query);
          const slugMatch = prod.slug && prod.slug.toLowerCase().includes(query);

          // Check variant fields
          const variantMatch = Array.isArray(prod.variants) && prod.variants.some((v) => {
            return (
              (v.variant && v.variant.toLowerCase().includes(query)) ||
              (v.sku && String(v.sku).toLowerCase().includes(query))
            );
          });

          // Category name match
          const catNameMatch = cat.category_name && cat.category_name.toLowerCase().includes(query);

          return nameMatch || skuMatch || slugMatch || variantMatch || catNameMatch;
        });

        if (matchingProducts.length === 0 && query) {
          return null;
        }

        // Calculate category totals for filtered subset if filtered
        const isSubset = matchingProducts.length !== rawProducts.length;
        const filteredTotalProducts = isSubset ? matchingProducts.length : (cat.total_products || matchingProducts.length);
        const filteredTotalVariants = isSubset
          ? matchingProducts.reduce((acc, p) => acc + (p.variants_count || (p.variants || []).length || 1), 0)
          : (cat.total_variants || matchingProducts.reduce((acc, p) => acc + (p.variants_count || (p.variants || []).length || 1), 0));
        const filteredTotalStock = isSubset
          ? matchingProducts.reduce((acc, p) => acc + (Number(p.total_stock) || 0), 0)
          : (cat.total_stock ?? matchingProducts.reduce((acc, p) => acc + (Number(p.total_stock) || 0), 0));
        const filteredPurchaseVal = isSubset
          ? matchingProducts.reduce((acc, p) => acc + (Number(p.product_purchase_value) || 0), 0)
          : (cat.category_purchase_value ?? matchingProducts.reduce((acc, p) => acc + (Number(p.product_purchase_value) || 0), 0));
        const filteredSaleVal = isSubset
          ? matchingProducts.reduce((acc, p) => acc + (Number(p.product_sale_value) || 0), 0)
          : (cat.category_sale_value ?? matchingProducts.reduce((acc, p) => acc + (Number(p.product_sale_value) || 0), 0));

        return {
          ...cat,
          products: matchingProducts,
          total_products: filteredTotalProducts,
          total_variants: filteredTotalVariants,
          total_stock: filteredTotalStock,
          category_purchase_value: filteredPurchaseVal,
          category_sale_value: filteredSaleVal,
          formatted_category_purchase_value: cat.formatted_category_purchase_value || formatINR(filteredPurchaseVal),
          formatted_category_sale_value: cat.formatted_category_sale_value || formatINR(filteredSaleVal),
        };
      })
      .filter(Boolean);
  }, [categoriesData, activeSearchQuery, selectedCategory, stockStatusFilter]);

  // Flattened product list for flat view mode
  const allFilteredProducts = useMemo(() => {
    const list = [];
    filteredCategories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        list.push({
          ...prod,
          category_name: cat.category_name,
        });
      });
    });
    return list;
  }, [filteredCategories]);

  // Computed summary metrics
  const calculatedSummary = useMemo(() => {
    if (activeSearchQuery || selectedCategory !== "all" || stockStatusFilter !== "all") {
      const catCount = filteredCategories.length;
      const prodCount = allFilteredProducts.length;
      let variantCount = 0;
      let stockCount = 0;
      let purchaseVal = 0;
      let saleVal = 0;

      allFilteredProducts.forEach((p) => {
        variantCount += p.variants_count || (p.variants || []).length || 1;
        stockCount += Number(p.total_stock) || 0;
        purchaseVal += Number(p.product_purchase_value) || 0;
        saleVal += Number(p.product_sale_value) || 0;
      });

      return {
        total_categories: catCount,
        total_products: prodCount,
        total_variants: variantCount,
        total_stock: stockCount,
        total_purchase_value: purchaseVal,
        total_sale_value: saleVal,
        formatted_total_purchase_value: formatINR(purchaseVal),
        formatted_total_sale_value: formatINR(saleVal),
      };
    }

    if (summaryData) {
      return summaryData;
    }

    // Default calculations from full categories
    let prodCount = 0;
    let variantCount = 0;
    let stockCount = 0;
    let purchaseVal = 0;
    let saleVal = 0;

    categoriesData.forEach((c) => {
      prodCount += c.total_products || (c.products || []).length;
      variantCount += c.total_variants || (c.products || []).reduce((acc, p) => acc + (p.variants_count || (p.variants || []).length || 1), 0);
      stockCount += Number(c.total_stock) || 0;
      purchaseVal += Number(c.category_purchase_value) || 0;
      saleVal += Number(c.category_sale_value) || 0;
    });

    return {
      total_categories: categoryPagination?.total_categories || categoriesData.length,
      total_products: prodCount,
      total_variants: variantCount,
      total_stock: stockCount,
      total_purchase_value: purchaseVal,
      total_sale_value: saleVal,
      formatted_total_purchase_value: formatINR(purchaseVal),
      formatted_total_sale_value: formatINR(saleVal),
    };
  }, [summaryData, categoriesData, categoryPagination, filteredCategories, allFilteredProducts, activeSearchQuery, selectedCategory, stockStatusFilter]);

  // Paginated categories for top-level pagination
  const totalCategoriesCount = categoryPagination?.total_categories || filteredCategories.length;
  const totalPages = categoryPagination?.total_pages || Math.ceil(totalCategoriesCount / pageSize) || 1;

  const paginatedCategories = useMemo(() => {
    if (categoriesData.length <= pageSize && categoryPagination?.total_pages && categoryPagination.total_pages > 1) {
      return filteredCategories;
    }
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, categoriesData.length, categoryPagination, currentPage, pageSize]);

  // Paginated flat products
  const totalFlatProductsCount = allFilteredProducts.length;
  const totalFlatPages = Math.ceil(totalFlatProductsCount / pageSize) || 1;

  const paginatedFlatProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allFilteredProducts.slice(startIndex, startIndex + pageSize);
  }, [allFilteredProducts, currentPage, pageSize]);

  const handleGlobalPageChange = (newPage) => {
    const maxP = viewMode === "category" ? totalPages : totalFlatPages;
    if (newPage < 1 || newPage > maxP) return;
    setCurrentPage(newPage);
    loadReportData(newPage, pageSize, selectedCategory, activeSearchQuery);
  };

  const handlePageSizeChange = (e) => {
    const newLimit = Number(e.target.value) || 30;
    setPageSize(newLimit);
    setCurrentPage(1);
    loadReportData(1, newLimit, selectedCategory, activeSearchQuery);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      "Category Name",
      "Product ID",
      "Product Name",
      "Product SKU",
      "Variant Name",
      "Variant SKU",
      "Stock",
      "Stock Status",
      "Purchase Price (INR)",
      "Sale Price (INR)",
      "Purchase Value (INR)",
      "Sale Value (INR)",
    ];

    const rows = [];
    filteredCategories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        const variants = Array.isArray(prod.variants) && prod.variants.length > 0
          ? prod.variants
          : [
              {
                variant: "Default",
                sku: prod.sku || "",
                stock: prod.total_stock || 0,
                purchase_price: prod.purchase_price || 0,
                sale_price: prod.sale_price || 0,
                purchase_value: prod.product_purchase_value || 0,
                sale_value: prod.product_sale_value || 0,
                stock_status: prod.stock_status || "in_stock",
              },
            ];

        variants.forEach((v) => {
          rows.push([
            `"${(cat.category_name || "").replace(/"/g, '""')}"`,
            prod.product_id || "",
            `"${(prod.product_name || "").replace(/"/g, '""')}"`,
            `"${prod.sku || ""}"`,
            `"${(v.variant || "").replace(/"/g, '""')}"`,
            `"${v.sku || ""}"`,
            v.stock ?? 0,
            `"${v.stock_status || prod.stock_status || ""}"`,
            v.purchase_price ?? prod.purchase_price ?? 0,
            v.sale_price ?? prod.sale_price ?? 0,
            v.purchase_value ?? prod.product_purchase_value ?? 0,
            v.sale_value ?? prod.product_sale_value ?? 0,
          ]);
        });
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stock_Report_Hunter_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const estimatedProfit =
    (Number(calculatedSummary.total_sale_value) || 0) -
    (Number(calculatedSummary.total_purchase_value) || 0);

  const profitMarginPercent =
    calculatedSummary.total_purchase_value > 0
      ? (
          ((Number(calculatedSummary.total_sale_value) -
            Number(calculatedSummary.total_purchase_value)) /
            Number(calculatedSummary.total_purchase_value)) *
          100
        ).toFixed(1)
      : "0";

  return (
    <AppLayout>
      <div className="space-y-6 pb-16">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 shadow-2xs">
                <Boxes className="w-5 h-5" />
              </div>
              <span>Stock Report</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Home
              </Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-500">Inventory</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-700 font-medium">Stock Report Hunter</span>
            </div>
          </div>

        
        </div>


        {/* Filter & Search Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by category, product name, SKU code, or variant..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setActiveSearchQuery("");
                    loadReportData(1, pageSize, selectedCategory, "");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {/* Category Select Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="min-w-[160px]">
                <select
                  value={selectedCategory}
                  onChange={handleCategorySelectChange}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition"
                >
                  <option value="all">All Categories ({categoryPagination?.total_categories || categoriesData.length})</option>
                  {categoriesData.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name} ({c.total_products || (c.products || []).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status Select */}
              <div className="min-w-[140px]">
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition"
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="out_of_stock">Out of Stock Only</option>
                </select>
              </div>

              {(searchInput || activeSearchQuery || selectedCategory !== "all" || stockStatusFilter !== "all") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

        </form>

        {/* Content Section: Category Nested Tables or Flat List */}
        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-40"></div>
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-28"></div>
                </div>
                <div className="h-28 bg-slate-50 rounded-xl border border-slate-100"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center shadow-2xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Boxes className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No Stock Records Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No products or categories matched your search criteria. Try modifying your search keywords or clearing active filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === "category" ? (
          /* Category-Grouped Accordion View */
          <div className="space-y-5">
            {paginatedCategories.map((cat, catIdx) => {
              const isExpanded = !!expandedCategories[cat.category_id];
              const productsList = cat.products || [];
              const productPagination = cat.product_pagination;
              const isCatLoading = !!categoryLoading[cat.category_id];

              const currentCatPage = productPagination?.page || 1;
              const totalCatPages =
                productPagination?.total_pages ||
                Math.ceil((cat.total_products || productsList.length) / pageSize) ||
                1;
              const hasMoreProducts =
                productPagination?.has_more !== undefined
                  ? productPagination.has_more
                  : productsList.length < (cat.total_products || 0);

              return (
                <div
                  key={cat.category_id || catIdx}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all duration-200"
                >
                  {/* Category Header Row (Clickable Accordion) */}
                  <div
                    onClick={() => toggleCategory(cat.category_id)}
                    className="px-5 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50/80 hover:bg-slate-100/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4 cursor-pointer select-none transition"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Category Image / Thumbnail */}
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                        {cat.image_url ? (
                          <img
                            src={getSafeImageUrl(cat.image_url)}
                            alt={cat.category_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <FolderTree className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Category Title & Info */}
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-base font-bold text-slate-900 tracking-tight">
                            {cat.category_name}
                          </h2>
                          {/* <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {cat.total_products} Products
                           
                          </span> */}
                          {/* <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {cat.total_stock} Pcs Stock
                          </span> */}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {cat.slug && <span className="font-mono text-slate-400">/{cat.slug}</span>}
                          {/* <span>•</span>
                          <span>{cat.total_variants} total variants</span> */}
                        </div>
                      </div>
                    </div>

                    {/* Category Right Metrics & Expand Indicator */}
                    <div className="flex items-center gap-4 sm:gap-6">


                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Products Table Content */}
                  {isExpanded && (
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4 w-14 text-center">#</th>
                            <th className="py-3 px-4 min-w-[300px]">Product</th>
                            <th className="py-3 px-4 w-44">SKU</th>
                            <th className="py-3 px-4 w-28 text-center">Stock</th>
                            <th className="py-3 px-4 w-32 text-center">Variants</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {productsList.map((prod, pIdx) => {
                            const isProdVariantsExpanded = !!expandedProducts[prod.product_id];
                            const variantsList = Array.isArray(prod.variants) ? prod.variants : [];
                            const hasMultipleVariants = variantsList.length > 0;
                            const isOutOfStock = (prod.total_stock ?? 0) <= 0 || prod.stock_status === "out_of_stock";

                            return (
                              <React.Fragment key={prod.product_id || pIdx}>
                                <tr className="hover:bg-slate-50/80 transition group">
                                  {/* Row Index */}
                                  <td className="py-3.5 px-4 w-14 text-center font-bold text-slate-400 group-hover:text-slate-600">
                                    {pIdx + 1}
                                  </td>

                                  {/* Product Name & Image */}
                                  <td className="py-3.5 px-4 min-w-[300px]">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 shrink-0 overflow-hidden flex items-center justify-center">
                                        {prod.cover_image_url ? (
                                          <img
                                            src={getSafeImageUrl(prod.cover_image_url)}
                                            alt={prod.product_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = "none";
                                            }}
                                          />
                                        ) : (
                                          <Package className="w-4 h-4 text-slate-400" />
                                        )}
                                      </div>
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                          {prod.product_name}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span
                                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                              isOutOfStock
                                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            }`}
                                          >
                                            {isOutOfStock ? "Out of Stock" : "In Stock"}
                                          </span>
                                          {prod.slug && (
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              {prod.slug}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* SKU */}
                                  <td className="py-3.5 px-4 w-44 font-mono font-bold text-slate-800">
                                    {prod.sku || "-"}
                                  </td>

                                  {/* Total Stock */}
                                  <td className="py-3.5 px-4 w-28 text-center">
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                                        isOutOfStock
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-emerald-100 text-emerald-800"
                                      }`}
                                    >
                                      {prod.total_stock ?? 0}
                                    </span>
                                  </td>

                                  {/* Variants Accordion Trigger */}
                                  <td className="py-3.5 px-4 w-32 text-center">
                                    {hasMultipleVariants ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleProductVariants(prod.product_id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition cursor-pointer"
                                      >
                                        <span>{variantsList.length} var</span>
                                        {isProdVariantsExpanded ? (
                                          <ChevronUp className="w-3 h-3" />
                                        ) : (
                                          <ChevronDown className="w-3 h-3" />
                                        )}
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        1 default
                                      </span>
                                    )}
                                  </td>
                                </tr>

                                {/* Expandable Variants Sub-Table */}
                                {isProdVariantsExpanded && variantsList.length > 0 && (
                                  <tr className="bg-slate-50/90 border-y border-indigo-100">
                                    <td colSpan={5} className="p-4 pl-12">
                                      <div className="bg-white rounded-xl border border-indigo-200/80 shadow-2xs overflow-hidden">
                                        <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
                                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>Variant Details for &quot;{prod.product_name}&quot;</span>
                                          </span>
                                          <span className="text-[11px] font-semibold text-indigo-700">
                                            {variantsList.length} Active Variations
                                          </span>
                                        </div>

                                        <table className="w-full text-left text-xs">
                                          <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                              <th className="py-2.5 px-3 min-w-[160px]">Variant Option / Size</th>
                                              <th className="py-2.5 px-3 w-36">Variant SKU</th>
                                              <th className="py-2.5 px-3 w-28 text-center">Variant Stock</th>
                                              {/* <th className="py-2.5 px-3 w-28 text-right">Purchase Price</th>
                                              <th className="py-2.5 px-3 w-28 text-right">Sale Price</th>
                                              <th className="py-2.5 px-3 w-32 text-right">Purchase Value</th>
                                              <th className="py-2.5 px-3 w-32 text-right">Sale Value</th> */}
                                              <th className="py-2.5 px-3 w-24 text-center">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {variantsList.map((v, vIdx) => {
                                              const vOutOfStock = (v.stock ?? 0) <= 0 || v.stock_status === "out_of_stock";
                                              return (
                                                <tr key={v.variant_id || vIdx} className="hover:bg-slate-50/50">
                                                  <td className="py-2.5 px-3 min-w-[160px] font-bold text-slate-900">
                                                    {v.variant || "Standard"}
                                                  </td>
                                                  <td className="py-2.5 px-3 w-36 font-mono text-slate-700">
                                                    {v.sku || "-"}
                                                  </td>
                                                  <td className="py-2.5 px-3 w-28 text-center font-bold">
                                                    <span
                                                      className={`px-2 py-0.5 rounded text-[11px] ${
                                                        vOutOfStock
                                                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                      }`}
                                                    >
                                                      {v.stock ?? 0}
                                                    </span>
                                                  </td>
                                                  {/* <td className="py-2.5 px-3 w-28 text-right text-slate-600">
                                                    {formatINR(v.purchase_price ?? v.variation_price)}
                                                  </td>
                                                  <td className="py-2.5 px-3 w-28 text-right font-semibold text-slate-900">
                                                    {formatINR(v.sale_price ?? v.price)}
                                                  </td>
                                                  <td className="py-2.5 px-3 w-32 text-right text-slate-700">
                                                    {v.formatted_purchase_value || formatINR(v.purchase_value)}
                                                  </td>
                                                  <td className="py-2.5 px-3 w-32 text-right font-bold text-emerald-700">
                                                    {v.formatted_sale_value || formatINR(v.sale_value)}
                                                  </td> */}
                                                  <td className="py-2.5 px-3 w-24 text-center">
                                                    <span
                                                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                        vOutOfStock
                                                          ? "bg-rose-100 text-rose-700"
                                                          : "bg-emerald-100 text-emerald-800"
                                                      }`}
                                                    >
                                                      {vOutOfStock ? "Out" : "In Stock"}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Category-Specific Pagination Bar */}
                      <div className="px-5 py-3 bg-slate-50/90 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-slate-600 font-medium flex items-center gap-2">
                        
                          {totalCatPages > 1 && (
                            <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                             
                            </span>
                          )}
                          {isCatLoading && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Loading products...
                            </span>
                          )}
                        </div>

                        {/* Category Pagination Number Controls (Appends products to list on click) */}
                        {totalCatPages > 1 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => loadCategoryProducts(cat.category_id, Math.max(1, currentCatPage - 1))}
                              disabled={currentCatPage <= 1 || isCatLoading}
                              className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer text-xs font-semibold shadow-2xs"
                              title="Previous Page"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Prev</span>
                            </button>

                            {Array.from({ length: totalCatPages }).map((_, i) => {
                              const pNum = i + 1;
                              const isPageActive = pNum === currentCatPage;
                              return (
                                <button
                                  key={pNum}
                                  type="button"
                                  onClick={() => loadCategoryProducts(cat.category_id, pNum)}
                                  disabled={isCatLoading}
                                  className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                                    isPageActive
                                      ? "bg-emerald-600 text-white shadow-2xs"
                                      : "border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                                  }`}
                                  title={`Load page ${pNum} and add to products`}
                                >
                                  {pNum}
                                </button>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => loadCategoryProducts(cat.category_id, Math.min(totalCatPages, currentCatPage + 1))}
                              disabled={currentCatPage >= totalCatPages || isCatLoading}
                              className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer text-xs font-semibold shadow-2xs"
                              title="Next Page"
                            >
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Top-Level Categories Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 text-xs text-slate-500 shadow-2xs">
              <span>
                Showing {totalCategoriesCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalCategoriesCount)} of {totalCategoriesCount} categories
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleGlobalPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pNum = currentPage - 2 + i;
                    }
                    if (pNum > totalPages) {
                      pNum = totalPages - (4 - i);
                    }
                  }
                  if (pNum < 1 || pNum > totalPages) return null;

                  const isActive = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handleGlobalPageChange(pNum)}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleGlobalPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Flat Table View */
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">
                    Flat Product List ({totalFlatProductsCount} items)
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Sorted across all categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Product Name</th>
                      <th className="py-3.5 px-4 w-28">SKU Code</th>
                      <th className="py-3.5 px-4 w-24 text-center">Stock</th>
                      <th className="py-3.5 px-4 text-right w-28">Purchase Price</th>
                      <th className="py-3.5 px-4 text-right w-28">Sale Price</th>
                      <th className="py-3.5 px-4 text-right w-32">Total Purchase</th>
                      <th className="py-3.5 px-4 text-right w-32">Total Sale</th>
                      <th className="py-3.5 px-4 text-center w-24">Variants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedFlatProducts.map((prod, pIdx) => {
                      const isProdVariantsExpanded = !!expandedProducts[prod.product_id];
                      const variantsList = Array.isArray(prod.variants) ? prod.variants : [];
                      const hasMultipleVariants = variantsList.length > 0;
                      const isOutOfStock = (prod.total_stock ?? 0) <= 0 || prod.stock_status === "out_of_stock";
                      const itemIndex = (currentPage - 1) * pageSize + pIdx + 1;

                      return (
                        <React.Fragment key={prod.product_id || pIdx}>
                          <tr className="hover:bg-slate-50/80 transition group">
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                              {itemIndex}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {prod.category_name}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                  {prod.cover_image_url ? (
                                    <img
                                      src={getSafeImageUrl(prod.cover_image_url)}
                                      alt={prod.product_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    {prod.product_name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {prod.slug}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {prod.sku || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black ${
                                  isOutOfStock
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {prod.total_stock ?? 0}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                              {formatINR(prod.purchase_price)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                              {formatINR(prod.sale_price)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                              {prod.formatted_product_purchase_value ||
                                formatINR(prod.product_purchase_value)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                              {prod.formatted_product_sale_value ||
                                formatINR(prod.product_sale_value)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {hasMultipleVariants ? (
                                <button
                                  type="button"
                                  onClick={() => toggleProductVariants(prod.product_id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition cursor-pointer"
                                >
                                  <span>{variantsList.length} var</span>
                                  {isProdVariantsExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">1 var</span>
                              )}
                            </td>
                          </tr>

                          {isProdVariantsExpanded && variantsList.length > 0 && (
                            <tr className="bg-slate-50/90 border-y border-indigo-100">
                              <td colSpan={10} className="p-4 pl-12">
                                <div className="bg-white rounded-xl border border-indigo-200/80 shadow-2xs overflow-hidden">
                                  <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-900">
                                      Variant Breakdown: {prod.product_name}
                                    </span>
                                  </div>
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                        <th className="py-2.5 px-3">Variant Option</th>
                                        <th className="py-2.5 px-3">SKU</th>
                                        <th className="py-2.5 px-3 text-center">Stock</th>
                                        <th className="py-2.5 px-3 text-right">Purchase Price</th>
                                        <th className="py-2.5 px-3 text-right">Sale Price</th>
                                        <th className="py-2.5 px-3 text-right">Purchase Value</th>
                                        <th className="py-2.5 px-3 text-right">Sale Value</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {variantsList.map((v, vIdx) => (
                                        <tr key={v.variant_id || vIdx} className="hover:bg-slate-50/50">
                                          <td className="py-2.5 px-3 font-bold text-slate-900">
                                            {v.variant || "Standard"}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono text-slate-700">
                                            {v.sku || "-"}
                                          </td>
                                          <td className="py-2.5 px-3 text-center font-bold">
                                            <span
                                              className={`px-2 py-0.5 rounded text-[11px] ${
                                                (v.stock ?? 0) <= 0
                                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                              }`}
                                            >
                                              {v.stock ?? 0}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-600">
                                            {formatINR(v.purchase_price ?? v.variation_price)}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                                            {formatINR(v.sale_price ?? v.price)}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-slate-700">
                                            {v.formatted_purchase_value || formatINR(v.purchase_value)}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                                            {v.formatted_sale_value || formatINR(v.sale_value)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls for Flat View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 text-xs text-slate-500 shadow-2xs">
              <span>
                Showing {totalFlatProductsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalFlatProductsCount)} of {totalFlatProductsCount} products
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleGlobalPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(5, totalFlatPages) }).map((_, i) => {
                  let pNum = i + 1;
                  if (totalFlatPages > 5) {
                    if (currentPage > 3) {
                      pNum = currentPage - 2 + i;
                    }
                    if (pNum > totalFlatPages) {
                      pNum = totalFlatPages - (4 - i);
                    }
                  }
                  if (pNum < 1 || pNum > totalFlatPages) return null;

                  const isActive = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handleGlobalPageChange(pNum)}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleGlobalPageChange(currentPage + 1)}
                  disabled={currentPage === totalFlatPages || loading}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
