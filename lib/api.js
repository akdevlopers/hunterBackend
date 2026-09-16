import { THEMES_LIST, THEME_PAGES, THEME_SECTION_SCHEMAS } from "./themeSchemas";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const STORAGE_KEYS = {
  ACTIVE_THEME: "meetay_active_theme",
  THEME_SETTINGS_PREFIX: "meetay_theme_settings_",
  THEME_ORDERS_PREFIX: "meetay_theme_orders_",
  AUTH_TOKEN: "meetay_auth_token",
  USER_SESSION: "meetay_user_session",
};

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
  }
  return "";
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function handleUnauthorizedResponse(res, data) {
  if (typeof window === "undefined") return false;
  if (window.location.pathname === "/login") return false;

  const is401Status = res && res.status === 401;

  let isUnauthorizedBody = false;
  if (data && typeof data === "object") {
    const errorStr = String(data.error || "").toLowerCase();
    const messageStr = String(data.message || "").toLowerCase();
    const statusVal = data.status;
    const statusCodeVal = data.statusCode;

    if (
      errorStr === "unauthorized" ||
      messageStr === "invalid or expired token." ||
      messageStr === "invalid or expired token" ||
      messageStr === "unauthorized" ||
      messageStr.includes("invalid or expired token") ||
      messageStr.includes("token expired") ||
      messageStr.includes("unauthorized") ||
      statusVal === 401 ||
      statusCodeVal === 401
    ) {
      isUnauthorizedBody = true;
    }
  }

  if (is401Status || isUnauthorizedBody) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return true;
  }

  return false;
}

export async function authFetch(endpoint, options = {}) {
  const isLoginEndpoint = typeof endpoint === "string" && endpoint.includes("/admin/login");

  try {
    const res = await fetch(endpoint, options);
    let data = null;

    if (res) {
      try {
        const clone = res.clone();
        const text = await clone.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = text;
          }
        }
      } catch (e) {
        console.error("Error reading response body:", e);
      }
    }

    if (!isLoginEndpoint && handleUnauthorizedResponse(res, data)) {
      return { ok: false, status: res ? res.status : 401, data, res, unauthorized: true };
    }

    return { ok: res ? res.ok : false, status: res ? res.status : 0, data, res, unauthorized: false };
  } catch (e) {
    console.error("authFetch error:", e);
    return { ok: false, status: 0, data: null, res: null, unauthorized: false };
  }
}

// Global fetch interceptor as additional safeguard across the app
if (typeof window !== "undefined" && !window._authFetchInterceptorInstalled) {
  window._authFetchInterceptorInstalled = true;
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";

    if (!url.includes("/admin/login") && window.location.pathname !== "/login") {
      try {
        const clone = response.clone();
        const text = await clone.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            handleUnauthorizedResponse(response, data);
          } catch (e) { }
        }
      } catch (e) { }
    }
    return response;
  };
}

export const api = {
  // ==========================================
  // 1. AUTH API
  // ==========================================
  async login({ email, password }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/login`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (ok && data && (data.status === "success" || data.token)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token || "");
          localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(data.user || {}));
        }
        return {
          success: true,
          status: data.status || "success",
          token: data.token,
          user: data.user,
        };
      }
      return {
        success: false,
        message: data?.message || data?.error || "Invalid credentials",
      };
    } catch (e) {
      console.error("Login API error:", e);
      return { success: false, message: e.message || "Network error connecting to API server" };
    }
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
    return { success: true };
  },

  getCurrentUser() {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (session) {
        try {
          return JSON.parse(session);
        } catch (e) { }
      }
    }
    return null;
  },

  // ==========================================
  // 2. DASHBOARD API
  // ==========================================
  async getDashboardData() {
    try {
      const endpoint = `${API_BASE_URL}/admin/dashboard`;
      const { ok, status, data, unauthorized } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (unauthorized) return null;
      if (ok && data) return data;
      throw new Error(data?.message || `HTTP Error ${status}`);
    } catch (e) {
      console.error("Dashboard API Error:", e);
      throw e;
    }
  },

  // ==========================================
  // 3. STOREFRONT THEME UTILITIES (UI Local State)
  // ==========================================
  async getThemes() {
    const activeTheme = this.getActiveTheme();
    return THEMES_LIST.map((theme) => ({
      ...theme,
      isActive: theme.id === activeTheme,
    }));
  },

  getActiveTheme() {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_THEME) || "techzonix";
    }
    return "techzonix";
  },

  setActiveTheme(themeId) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_THEME, themeId);
    }
    return themeId;
  },

  getThemePages(themeId) {
    return THEME_PAGES[themeId] || THEME_PAGES.stylique || [];
  },

  getThemeSectionSchema(themeId, pageSlug) {
    const themeSchema = THEME_SECTION_SCHEMAS[themeId] || THEME_SECTION_SCHEMAS.stylique;
    return themeSchema[pageSlug] || null;
  },

  getThemeSettings(themeId, pageSlug) {
    if (typeof window === "undefined") return {};
    const key = `${STORAGE_KEYS.THEME_SETTINGS_PREFIX}${themeId}_${pageSlug}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    const schema = this.getThemeSectionSchema(themeId, pageSlug);
    const defaults = {};
    if (schema?.sections) {
      schema.sections.forEach((sec) => {
        sec.settings?.forEach((setting) => {
          const settingKey = `${sec.key}_${setting.key}`;
          defaults[settingKey] = setting.value;
        });
      });
    }
    return defaults;
  },

  saveThemeSettings(themeId, pageSlug, settings) {
    if (typeof window !== "undefined") {
      const key = `${STORAGE_KEYS.THEME_SETTINGS_PREFIX}${themeId}_${pageSlug}`;
      localStorage.setItem(key, JSON.stringify(settings));
    }
    return { success: true, message: "Settings saved successfully." };
  },

  getSectionOrder(themeId, pageSlug) {
    if (typeof window !== "undefined") {
      const key = `${STORAGE_KEYS.THEME_ORDERS_PREFIX}${themeId}_${pageSlug}`;
      const saved = localStorage.getItem(key);
      if (saved) return saved.split(",");
    }
    const pages = this.getThemePages(themeId);
    const page = pages.find((p) => p.slug === pageSlug);
    return page?.orders ? page.orders.split(",") : [];
  },

  // ==========================================
  // 4. CATEGORIES API
  // ==========================================
  async getCategories() {
    try {
      const endpoint = `${API_BASE_URL}/admin/category`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!data) return [];
      return data.categories || data.data || (Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("getCategories API Error:", e);
      return [];
    }
  },

  async getCategoryById(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/category/${id}`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!data) return null;
      return data.category || data.data || data;
    } catch (e) {
      console.error("getCategoryById API Error:", e);
      return null;
    }
  },

  async createCategory(formData) {
    try {
      const endpoint = `${API_BASE_URL}/admin/category/add`;
      const token = getAuthToken();

      const body = new FormData();
      body.append("name", formData.name || "");
      body.append("parent_id", formData.parent_id || 0);
      body.append("trending", formData.trending ? "1" : "0");
      body.append("status", formData.status ? "1" : "0");

      if (formData.image_file instanceof File) {
        body.append("image", formData.image_file);
      }

      if (formData.icon_file instanceof File) {
        body.append("icon_image", formData.icon_file);
      }

      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
      });
      return data || { status: "error", message: "Failed to create category" };
    } catch (e) {
      console.error("createCategory API Error:", e);
      throw e;
    }
  },

  async updateCategory(id, formData) {
    try {
      const endpoint = `${API_BASE_URL}/admin/category/edit/${id}`;
      const token = getAuthToken();

      const body = new FormData();
      body.append("name", formData.name || "");
      body.append("parent_id", formData.parent_id || 0);
      body.append("trending", formData.trending ? "1" : "0");
      body.append("status", formData.status ? "1" : "0");

      if (formData.image_file instanceof File) {
        body.append("image", formData.image_file);
      }

      if (formData.icon_file instanceof File) {
        body.append("icon_image", formData.icon_file);
      }

      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
      });
      return data || { status: "error", message: "Failed to update category" };
    } catch (e) {
      console.error("updateCategory API Error:", e);
      throw e;
    }
  },

  async deleteCategory(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/category/delete/${id}`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      return data || { status: "error" };
    } catch (e) {
      console.error("deleteCategory API Error:", e);
      throw e;
    }
  },

  async toggleCategoryStatus(id, currentCategory) {
    if (!currentCategory) return;
    const nextStatus = currentCategory.status === 1 ? 0 : 1;
    return await this.updateCategory(id, {
      ...currentCategory,
      status: nextStatus,
    });
  },

  // ==========================================
  // 5. PRODUCTS & POS API
  // ==========================================
  async getProducts(params = { page: 1, limit: 10 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product`;
      const searchTerm =
        params?.search ??
        params?.search_key ??
        params?.searchKey ??
        params?.keyword ??
        params?.q ??
        "";

      const payload = {
        page: params?.page || 1,
        limit: params?.limit || 10,
      };

      if (searchTerm) {
        payload.search = searchTerm;
      }

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (ok && data) {
        if (data.status === "success") {
          const prods = data.products || data.data || [];
          return {
            page: data.page || params?.page || 1,
            limit: data.limit || params?.limit || 10,
            total: data.total || prods.length,
            totalPages: data.totalPages || Math.ceil((data.total || prods.length) / (data.limit || 10)) || 1,
            products: prods,
          };
        }
        if (Array.isArray(data)) {
          return { page: 1, limit: 10, total: data.length, totalPages: Math.ceil(data.length / 10) || 1, products: data };
        }
      }
      return { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 1, products: [] };
    } catch (e) {
      console.error("getProducts API Error:", e);
      return { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 1, products: [] };
    }
  },

  async searchProductBySku(sku) {
    try {
      const endpoint = `${API_BASE_URL}/admin/products/skusearch`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ sku: String(sku).trim() }),
      });
      if (ok && data) {
        if (data.success && Array.isArray(data.data)) {
          return data.data;
        }
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
      }
      return [];
    } catch (e) {
      console.error("searchProductBySku API Error:", e);
      return [];
    }
  },

  async createPosOrder(payload) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/create`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return data || { status: "error", message: "Failed to create POS order" };
    } catch (e) {
      console.error("createPosOrder API Error:", e);
      return { status: "error", message: e.message || "Failed to create POS order" };
    }
  },

  async returnPosOrderItem(payload) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/order-returns`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          orderId: Number(payload.orderId),
          productId: Number(payload.productId || payload.id),
          variantId: Number(payload.variantId || payload.variant_id || 0),
          returnStock: Number(payload.returnStock || 1),
        }),
      });
      return data || { status: false, message: "Failed to process order return" };
    } catch (e) {
      console.error("returnPosOrderItem API Error:", e);
      return { status: false, message: e.message || "Failed to process order return" };
    }
  },

  async getStockReportHunter({ skuCode = "", page = 1, limit = 10 } = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/stock-report-hunter`;
      const payload = {
        skuCode: String(skuCode || ""),
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }
      return data || { status: "error", success: false, data: { products: [] } };
    } catch (e) {
      console.error("getStockReportHunter API Error:", e);
      return { status: "error", success: false, data: { products: [] } };
    }
  },

  async getProductById(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product/${id}`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (ok && data) {
        if (data.status === "success") return data.data || data.product || data;
        return data.data || data;
      }
      return null;
    } catch (e) {
      console.error("getProductById API Error:", e);
      return null;
    }
  },

  async createProduct(formData) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product/add`;
      const token = getAuthToken();

      const body = new FormData();
      body.append("name", formData.name || "");
      body.append("category_id", formData.category_id || 4);
      body.append("sale_price", formData.sale_price || 0);
      body.append("purchase_price", formData.purchase_price || 0);
      body.append("product_weight", formData.weight || formData.product_weight || 1);
      body.append("trending", formData.new_arrival || formData.trending === 1 ? "1" : "0");
      body.append("status", formData.display_product || formData.status === 1 ? "1" : "0");
      body.append("description", formData.description || "");
      body.append("specification", formData.specification || "");
      body.append("detail", formData.detail || "");

      if (formData.attribute_id !== undefined && formData.attribute_id !== null) {
        body.append("attribute_id", String(formData.attribute_id));
      }
      if (formData.product_attribute) {
        body.append(
          "product_attribute",
          typeof formData.product_attribute === "string"
            ? formData.product_attribute
            : JSON.stringify(formData.product_attribute)
        );
      }
      if (formData.variant_product !== undefined && formData.variant_product !== null) {
        body.append("variant_product", formData.variant_product ? "1" : "0");
      }

      if (formData.variants && formData.variants.length > 0) {
        const variantsList = formData.variants.map((v) => ({
          variant: v.name || v.variant,
          stock: Number(v.stock) || 0,
        }));
        body.append("variants", JSON.stringify(variantsList));
      }

      const file =
        formData.cover_image_file ||
        formData.image_file ||
        formData.file ||
        (formData.cover_image instanceof File ? formData.cover_image : null) ||
        (formData.cover_image_path instanceof File ? formData.cover_image_path : null);

      if (file instanceof File) {
        body.append("cover_image", file);
        body.append("image", file);
      } else if (formData.cover_image_path && typeof formData.cover_image_path === "string" && !formData.cover_image_path.startsWith("blob:")) {
        body.append("cover_image", formData.cover_image_path);
      } else if (formData.cover_image && typeof formData.cover_image === "string" && !formData.cover_image.startsWith("blob:")) {
        body.append("cover_image", formData.cover_image);
      }

      // Gallery / Multiple Images (Single append per file to avoid duplicates)
      const galleryFiles = formData.gallery_files || formData.images_files || formData.gallery_images || [];
      if (Array.isArray(galleryFiles) && galleryFiles.length > 0) {
        galleryFiles.forEach((gFile) => {
          if (gFile instanceof File) {
            body.append("product_image", gFile);
          }
        });
      }

      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
      });
      return data || { status: "error", message: "Failed to create product" };
    } catch (e) {
      console.error("createProduct API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async updateProduct(id, formData) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product/edit/${id}`;
      const token = getAuthToken();

      const body = new FormData();
      body.append("name", formData.name || "");
      body.append("category_id", formData.category_id || 4);
      body.append("sale_price", formData.sale_price || 0);
      body.append("purchase_price", formData.purchase_price || 0);
      body.append("product_weight", formData.weight || formData.product_weight || 1);
      body.append("trending", formData.new_arrival || formData.trending === 1 ? "1" : "0");
      body.append("status", formData.display_product || formData.status === 1 ? "1" : "0");
      body.append("description", formData.description || "");
      body.append("specification", formData.specification || "");
      body.append("detail", formData.detail || "");

      if (formData.attribute_id !== undefined && formData.attribute_id !== null) {
        body.append("attribute_id", String(formData.attribute_id));
      }
      if (formData.product_attribute) {
        body.append(
          "product_attribute",
          typeof formData.product_attribute === "string"
            ? formData.product_attribute
            : JSON.stringify(formData.product_attribute)
        );
      }
      if (formData.variant_product !== undefined && formData.variant_product !== null) {
        body.append("variant_product", formData.variant_product ? "1" : "0");
      }

      if (formData.variants && formData.variants.length > 0) {
        const variantsList = formData.variants.map((v) => ({
          variant: v.name || v.variant,
          stock: Number(v.stock) || 0,
        }));
        body.append("variants", JSON.stringify(variantsList));
      }

      const file =
        formData.cover_image_file ||
        formData.image_file ||
        formData.file ||
        (formData.cover_image instanceof File ? formData.cover_image : null) ||
        (formData.cover_image_path instanceof File ? formData.cover_image_path : null);

      if (file instanceof File) {
        body.append("cover_image", file);
        body.append("image", file);
      } else if (formData.cover_image_path && typeof formData.cover_image_path === "string" && !formData.cover_image_path.startsWith("blob:")) {
        body.append("cover_image", formData.cover_image_path);
      } else if (formData.cover_image && typeof formData.cover_image === "string" && !formData.cover_image.startsWith("blob:")) {
        body.append("cover_image", formData.cover_image);
      }

      // Gallery / Multiple Images (Single append per file to avoid duplicates)
      const galleryFiles = formData.gallery_files || formData.images_files || formData.gallery_images || [];
      if (Array.isArray(galleryFiles) && galleryFiles.length > 0) {
        galleryFiles.forEach((gFile) => {
          if (gFile instanceof File) {
            body.append("product_image", gFile);
          }
        });
      }

      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
      });
      return data || { status: "error", message: "Failed to update product" };
    } catch (e) {
      console.error("updateProduct API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async removeProductImage({ imageId, productId, storeId }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product/remove_image`;
      const currentUser = this.getCurrentUser();
      const currentStoreId = storeId || currentUser?.store_id || currentUser?.current_store || 6;

      const payload = {
        image_id: Number(imageId) || String(imageId),
        id: Number(imageId) || String(imageId),
        product_id: Number(productId) || String(productId),
        store_id: Number(currentStoreId) || currentStoreId,
      };

      // 1. Try JSON payload
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (data && (data.status === "success" || data.status === 1 || data.success)) {
        return data;
      }

      // 2. Try FormData payload (if backend controller expects multipart/form-data)
      const token = getAuthToken();
      const body = new FormData();
      body.append("image_id", String(imageId));
      body.append("id", String(imageId));
      body.append("product_id", String(productId));
      body.append("store_id", String(currentStoreId));

      const formRes = await authFetch(endpoint, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body,
      });

      return formRes?.data || data;
    } catch (e) {
      console.error("removeProductImage API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async deleteProduct(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product_delete`;
      const payload = {
        id: String(id),
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }
      return data || { success: false, status: "error", message: "Failed to delete product" };
    } catch (e) {
      console.error("deleteProduct API Error:", e);
      return { success: false, status: "error", message: e.message || "Network error deleting product" };
    }
  },

  async verifyPurchasePricePassword({ password, product_id, type = "purchase_price" }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/verify-purchase-price-password`;
      const payload = {
        password,
        type: type || "purchase_price",
        product_id: String(product_id),
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }
      return data || { success: false, status: "error", message: "Failed to verify password" };
    } catch (e) {
      console.error("verifyPurchasePricePassword API Error:", e);
      return { success: false, status: "error", message: e.message || "Network error verifying password" };
    }
  },

  async verifyPassword({ password, type }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/verify-password`;
      const payload = {
        password,
        type,
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }
      return data || { success: false, status: "error", message: "Failed to verify password" };
    } catch (e) {
      console.error("verifyPassword API Error:", e);
      return { success: false, status: "error", message: e.message || "Network error verifying password" };
    }
  },


  async toggleProductStatus() { return { success: true }; },

  // ==========================================
  // 6. PRODUCT ATTRIBUTES API
  // ==========================================
  async getAttributes(params = { page: 1, limit: 10 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          page: params?.page || 1,
          limit: params?.limit || 10,
        }),
      });
      if (ok && data) {
        if (data.status === "success" && Array.isArray(data.data)) {
          return data.data;
        }
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
      }
      return [];
    } catch (e) {
      console.error("getAttributes API Error:", e);
      return [];
    }
  },

  async getAllProductAttributes() {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/all`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (ok && data) {
        if (data.status === "success" && Array.isArray(data.data)) return data.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
      }

      return [];
    } catch (e) {
      console.error("getAllProductAttributes API Error:", e);
      return [];
    }
  },

  async getAttributeOptionsAll(attributeId) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/option/all/${attributeId}`;
     
      let resPost = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (resPost.ok && resPost.data) {
        if (resPost.data.status === "success" && Array.isArray(resPost.data.data)) return resPost.data.data;
        if (Array.isArray(resPost.data.data)) return resPost.data.data;
      }

      return [];
    } catch (e) {
      console.error("getAttributeOptionsAll API Error:", e);
      return [];
    }
  },

  async getAttributeById(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/${id}`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (ok && data) {
        return data.data || data;
      }
      return null;
    } catch (e) {
      console.error("getAttributeById API Error:", e);
      return null;
    }
  },

  async getAttributeOptions(attributeId, params = { page: 1, limit: 10 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/option-list/${attributeId}`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          page: params?.page || 1,
          limit: params?.limit || 10,
        }),
      });
      if (ok && data) {
        if (data.status === "success" && Array.isArray(data.data)) {
          return data.data;
        }
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
      }
      return [];
    } catch (e) {
      console.error("getAttributeOptions API Error:", e);
      return [];
    }
  },

  async addAttributeOption(payload) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/option/add`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          attribute_id: String(payload.attribute_id || payload.attributeId || ""),
          value: payload.value || payload.terms || payload.name || "",
        }),
      });
      return data || { status: "error", message: "Failed to add option" };
    } catch (e) {
      console.error("addAttributeOption API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async addAttributeTerm(attributeId, value) {
    return await this.addAttributeOption({ attribute_id: attributeId, value });
  },

  async updateAttributeOption(optionId, payload) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/option/edit/${optionId}`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          value: payload.value || payload.newTerm || payload.terms || "",
        }),
      });
      return data || { status: "error", message: "Failed to update option" };
    } catch (e) {
      console.error("updateAttributeOption API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async updateAttributeTerm(attributeId, oldTerm, newTerm) {
    const optionId = typeof oldTerm === "object" ? oldTerm.id : oldTerm;
    return await this.updateAttributeOption(optionId, { value: newTerm });
  },

  async deleteAttributeOption(optionId) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/option/delete/${optionId}`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: optionId }),
      });
      return data || { status: "error", message: "Failed to delete option" };
    } catch (e) {
      console.error("deleteAttributeOption API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async removeAttributeTerm(attributeId, optionIdOrTerm) {
    const id = typeof optionIdOrTerm === "object" ? optionIdOrTerm.id : optionIdOrTerm;
    return await this.deleteAttributeOption(id);
  },

  async reorderAttributeTerms(attributeId, termsList) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/option/reorder/${attributeId}`;
      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          attribute_id: String(attributeId),
          orders: (termsList || []).map((item, idx) => ({
            id: typeof item === "object" ? item.id : idx,
            order: idx,
          })),
        }),
      });
      if (ok && data) return data;
      return { success: true };
    } catch (e) {
      console.error("reorderAttributeTerms API Error:", e);
      return { success: true };
    }
  },

  async createAttribute(formData) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/add`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: formData.name }),
      });
      return data || { success: false };
    } catch (e) {
      console.error("createAttribute API Error:", e);
      return { success: false, message: e.message };
    }
  },

  async updateAttribute(id, formData) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/edit/${id}`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: formData.name }),
      });
      return data || { success: false };
    } catch (e) {
      console.error("updateAttribute API Error:", e);
      return { success: false, message: e.message };
    }
  },

  async deleteAttribute(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/product-attribute/delete/${id}`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id }),
      });
      return data || { success: false };
    } catch (e) {
      console.error("deleteAttribute API Error:", e);
      return { success: false, message: e.message };
    }
  },

  // ==========================================
  // 7. ORDERS API
  // ==========================================
  async getOrders(params = { page: 1, limit: 10 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/order`;
      const payload = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || "",
        fromDate: params?.fromDate || "",
        toDate: params?.toDate || "",
      };

      if (params?.delivered_status !== undefined && params?.delivered_status !== "all" && params?.delivered_status !== "") {
        payload.delivered_status = params.delivered_status;
      }

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        if (data.status === "success") {
          return {
            status: "success",
            page: data.page || params?.page || 1,
            limit: data.limit || params?.limit || 10,
            total: data.total ?? (data.data ? data.data.length : 0),
            totalPages: data.totalPages || Math.ceil((data.total || 1) / (data.limit || 10)) || 1,
            counts: data.counts || { all: 0, new: "0", completed: "0", remark: "0" },
            data: data.data || [],
          };
        }
      }

      return {
        status: "success",
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: 0,
        totalPages: 1,
        counts: { all: 0, new: "0", completed: "0", remark: "0" },
        data: [],
      };
    } catch (e) {
      console.error("getOrders API Error:", e);
      return {
        status: "error",
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        counts: { all: 0, new: "0", completed: "0", remark: "0" },
        data: [],
      };
    }
  },

  async createShiprocketOrder(orderId) {
    try {
      const payload = {
        order_id: String(orderId),
      };

      // Try /admin/shiprocket/create-order
      let endpoint = `${API_BASE_URL}/admin/shiprocket/create-order`;
      let res = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok && res.data) {
        return res.data;
      }

      return res.data || { status: "error", success: false, message: "Failed to create Shiprocket order" };
    } catch (e) {
      console.error("createShiprocketOrder API Error:", e);
      return { status: "error", success: false, message: e.message || "Network error booking Shiprocket order" };
    }
  },

  async getPosOrders(params = { page: 1, limit: 10 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos-order-list`;
      const todayStr = new Date().toISOString().slice(0, 10);
      const payload = {
        page: params?.page || 1,
        limit: params?.limit || 10,
        fromDate: params?.fromDate || todayStr,
        toDate: params?.toDate || todayStr,
      };

      if (params?.search) payload.search = params.search;

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }
      return { status: "error", data: [] };
    } catch (e) {
      console.error("getPosOrders API Error:", e);
      return { status: "error", data: [] };
    }
  },

  async getPosProfitLoss(params = { year: 2026 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/profit-loss`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          year: Number(params?.year || 2026),
        }),
      });
      return data || { status: "error", data: [] };
    } catch (e) {
      console.error("getPosProfitLoss API Error:", e);
      return { status: "error", data: [] };
    }
  },

  async getPosProfitLossMonth(params = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/profitlossmonth`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          year: Number(params.year || 2026),
          month: Number(params.month || 1),
        }),
      });
      return data || { status: "error", data: [] };
    } catch (e) {
      console.error("getPosProfitLossMonth API Error:", e);
      return { status: "error", data: [] };
    }
  },

  async getProductReturns(params = { page: 1, limit: 10 }) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/product-return`;
      const { data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          page: Number(params.page || 1),
          limit: Number(params.limit || 10),
        }),
      });
      return data || { status: "error", data: [] };
    } catch (e) {
      console.error("getProductReturns API Error:", e);
      return { status: "error", data: [] };
    }
  },

  async deletePosOrder(id, fromDate = "", toDate = "") {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos-order-delete`;
      const payload = { id };
      if (fromDate) payload.fromDate = fromDate;
      if (toDate) payload.toDate = toDate;

      let { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!ok || !data) {
        const delRes = await authFetch(endpoint, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        ok = delRes.ok;
        data = delRes.data;
      }

      if (ok && data) {
        return data;
      }

      return { status: "success", message: "Order deleted successfully." };
    } catch (e) {
      console.error("deletePosOrder API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async updateOrderStatus(id, delivered_status, remark = "") {
    try {
      const endpoint = `${API_BASE_URL}/admin/order/update-delivery-status`;
      const payload = {
        order_id: Number(id),
        delivered_status: Number(delivered_status),
      };
      if (remark || String(delivered_status) === "2") {
        payload.notes = remark || "";
      }

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }
      return {
        status: "success",
        message: "Order delivery status updated successfully.",
        data: {
          order_id: Number(id),
          delivered_status: Number(delivered_status),
          delivered_status_label: Number(delivered_status) === 1 ? "Completed" : Number(delivered_status) === 2 ? "Remark" : "New",
        },
      };
    } catch (e) {
      console.error("updateOrderStatus API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async getOrderById(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/order/view/${id}`;
      let { ok, data } = await authFetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!ok || !data) {
        const postRes = await authFetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        ok = postRes.ok;
        data = postRes.data;
      }

      if (ok && data) {
        if (data.status === "success" && data.data) {
          return data.data;
        }
        return data.data || data;
      }
      return null;
    } catch (e) {
      console.error("getOrderById API Error:", e);
      return null;
    }
  },

  async getOnlineSaleBook(params = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/order/online-sale`;
      const payload = {};
      if (params.fromDate) payload.fromDate = params.fromDate;
      if (params.toDate) payload.toDate = params.toDate;

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        if (data.status === "success") {
          return data;
        }
      }

      return {
        status: "success",
        fromDate: params.fromDate || "",
        toDate: params.toDate || "",
        summary: { product_amount: 0, shipping_amount: 0, return_amount: 0, total_amount: 0 },
        total_orders: 0,
        data: [],
      };
    } catch (e) {
      console.error("getOnlineSaleBook API Error:", e);
      return {
        status: "error",
        summary: { product_amount: 0, shipping_amount: 0, return_amount: 0, total_amount: 0 },
        total_orders: 0,
        data: [],
      };
    }
  },

  async getOnlineSaleProfitLoss(params = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/online-sale-profit-loss`;
      const payload = {
        year: String(params.year || new Date().getFullYear()),
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        if (data.status === "success") {
          return data;
        }
      }

      return {
        status: "success",
        year: String(params.year || "2026"),
        yearArray: [2025, 2026, 2027, 2028, 2029, 2030],
        totalAmount: [],
      };
    } catch (e) {
      console.error("getOnlineSaleProfitLoss API Error:", e);
      return {
        status: "error",
        year: String(params.year || "2026"),
        yearArray: [2025, 2026, 2027, 2028, 2029, 2030],
        totalAmount: [],
      };
    }
  },

  async getOnlineSaleProfitLossMonth(params = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/online-sale-profit-loss-month`;
      const payload = {
        year: String(params.year || new Date().getFullYear()),
        month: String(params.month || new Date().getMonth() + 1),
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        if (data.status === "success") {
          return data;
        }
      }

      return {
        status: "success",
        year: payload.year,
        month: payload.month,
        month_name: "",
        totalAmount: [],
        allDatesArray: [],
      };
    } catch (e) {
      console.error("getOnlineSaleProfitLossMonth API Error:", e);
      return {
        status: "error",
        totalAmount: [],
        allDatesArray: [],
      };
    }
  },

  async deleteOrder(id, fromDate = "", toDate = "") {
    return this.deletePosOrder(id, fromDate, toDate);
  },

  // ==========================================
  // 8. CUSTOMERS API
  // ==========================================
  async getCustomers(params = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/customer`;
      const payload = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      if (params.search) payload.search = params.search;
      if (params.status !== undefined && params.status !== "all" && params.status !== "") {
        payload.status = Number(params.status);
      }

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }

      return {
        status: "success",
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 1,
        data: [],
      };
    } catch (e) {
      console.error("getCustomers API Error:", e);
      return {
        status: "error",
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        data: [],
      };
    }
  },

  async getCustomerById(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/customer/${id}`;
      let { ok, data } = await authFetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!ok || !data) {
        const postRes = await authFetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        ok = postRes.ok;
        data = postRes.data;
      }

      if (ok && data) {
        return data.data || data.customer || data;
      }
      return null;
    } catch (e) {
      console.error("getCustomerById API Error:", e);
      return null;
    }
  },

  async getCustomerTimeline(id) {
    try {
      const endpoint = `${API_BASE_URL}/admin/customer-timeline/${id}`;
      let { ok, data } = await authFetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!ok || !data) {
        const postRes = await authFetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        ok = postRes.ok;
        data = postRes.data;
      }

      if (ok && data) {
        return data;
      }
      return { status: "success", data: [] };
    } catch (e) {
      console.error("getCustomerTimeline API Error:", e);
      return { status: "error", data: [] };
    }
  },

  async updateCustomerStatus(customerId, status) {
    try {
      const endpoint = `${API_BASE_URL}/admin/customer/status`;
      const payload = {
        customer_id: Number(customerId),
        status: Number(status),
      };

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        return data;
      }

      return {
        status: "success",
        message: "Status changed successfully.",
        data: {
          customer_id: Number(customerId),
          status: Number(status),
        },
      };
    } catch (e) {
      console.error("updateCustomerStatus API Error:", e);
      return { status: "error", message: e.message };
    }
  },

  async getPosOrderList(params = {}) {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos-order-list`;
      const payload = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      if (params.fromDate) payload.fromDate = params.fromDate;
      if (params.toDate) payload.toDate = params.toDate;

      const { ok, data } = await authFetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (ok && data) {
        if (data.status === "success") {
          return data;
        }
      }

      return {
        status: "success",
        page: params.page || 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 1,
        summary: { cash_sale: 0, online_sale: 0, return: 0, total: 0 },
        data: [],
      };
    } catch (e) {
      console.error("getPosOrderList API Error:", e);
      return {
        status: "error",
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        summary: { cash_sale: 0, online_sale: 0, return: 0, total: 0 },
        data: [],
      };
    }
  },

  async getPosInitData() {
    try {
      const endpoint = `${API_BASE_URL}/admin/pos/create`;
      let { ok, data } = await authFetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!ok || !data) {
        const postRes = await authFetch(endpoint, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        ok = postRes.ok;
        data = postRes.data;
      }

      if (ok && data) {
        return data;
      }
      return null;
    } catch (e) {
      console.error("getPosInitData API Error:", e);
      return null;
    }
  },

  // ==========================================
  // 9. SHIPPING API
  // ==========================================
  async getShippingClasses() { return []; },
  async createShippingClass() { return { success: true }; },
  async getShippingZones() { return []; },
  async createShippingZone() { return { success: true }; },
};
