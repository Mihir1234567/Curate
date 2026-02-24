import { Product, Category, StatCard } from "../types";
import { Feedback } from "../types/feedback";
import { AnalyticsData } from "../types/analytics";
import { getToken, setToken, removeToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// ── Helper ───────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options?.headers,
    },
  });

  if (res.status === 401 && getToken()) {
    removeToken();
    if (!window.location.hash.includes("/admin/login")) {
      window.location.hash = "#/admin/login";
    }
  }

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${res.statusText}`);
  }

  return json as ApiResponse<T>;
}

// ── Query Params ─────────────────────────────────────

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}

function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

// ── API ──────────────────────────────────────────────

export const api = {
  // ── Auth ──────────────────────────────────────────

  loginAdmin: async (
    email: string,
    password: string,
  ): Promise<{ token: string; admin: { id: string; email: string } }> => {
    const res = await request<{
      token: string;
      admin: { id: string; email: string };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.data.token);
    return res.data;
  },

  logoutAdmin: (): void => {
    removeToken();
  },

  // ── Products ─────────────────────────────────────

  getProducts: async (params?: ProductQueryParams): Promise<Product[]> => {
    const qs = buildQueryString({
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
      category: params?.category,
      sort: params?.sort,
    });
    const res = await request<Product[]>(`/api/products${qs}`);
    return res.data;
  },

  getProductBySlug: async (slug: string): Promise<Product | undefined> => {
    try {
      const res = await request<Product>(`/api/products/${slug}`);
      return res.data;
    } catch {
      return undefined;
    }
  },

  createProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    const res = await request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return res.data;
  },

  updateProduct: async (
    id: string,
    product: Partial<Product> & { removedImages?: string[] },
  ): Promise<Product> => {
    const res = await request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
    return res.data;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await request<null>(`/api/products/${id}`, { method: "DELETE" });
    return true;
  },

  bulkDeleteProducts: async (ids: string[]): Promise<boolean> => {
    await request<null>("/api/products/bulk", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
    return true;
  },

  // ── Stats ────────────────────────────────────────

  getStats: async (): Promise<StatCard[]> => {
    const res = await request<StatCard[]>("/api/products/stats");
    return res.data;
  },

  // ── Categories ───────────────────────────────────

  getCategories: async (): Promise<Category[]> => {
    const res = await request<Category[]>("/api/categories");
    return res.data;
  },

  createCategory: async (payload: {
    name: string;
    imageUploadUrl?: string;
    featuredProductId?: string;
    productIds?: string[];
  }): Promise<Category> => {
    const res = await request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateCategory: async (
    id: string,
    payload: {
      name: string;
      imageUploadUrl?: string;
      featuredProductId?: string | null;
      productIds?: string[];
    },
  ): Promise<Category> => {
    const res = await request<Category>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await request<null>(`/api/categories/${id}`, { method: "DELETE" });
  },

  // ── Analytics ────────────────────────────────────

  getAnalyticsData: async (): Promise<AnalyticsData> => {
    const res = await request<AnalyticsData>("/api/analytics");
    return res.data;
  },

  // ── Feedback ─────────────────────────────────────

  getFeedback: async (): Promise<Feedback[]> => {
    const res = await request<Feedback[]>("/api/feedback");
    return res.data;
  },

  createFeedback: async (
    feedback: Omit<Feedback, "_id" | "createdAt" | "status">,
  ): Promise<Feedback> => {
    const res = await request<Feedback>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(feedback),
    });
    return res.data;
  },

  updateFeedbackStatus: async (
    id: string,
    status: "new" | "reviewed",
  ): Promise<Feedback> => {
    const res = await request<Feedback>(`/api/feedback/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  deleteFeedback: async (id: string): Promise<boolean> => {
    await request<null>(`/api/feedback/${id}`, { method: "DELETE" });
    return true;
  },

  // ── Upload ───────────────────────────────────────

  uploadImages: async (
    files: File[],
  ): Promise<{ url: string; publicId: string }[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const url = `${API_BASE_URL}/api/upload`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        ...authHeaders(),
      },
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Image upload failed");
    }

    return json.data;
  },
};
