/* ============================================================
   KalaSetu — Typed API Client
   Fetch wrapper with JWT interceptor and automatic refresh
   ============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401 && token) {
      // Try to refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
        if (!retryResponse.ok) {
          throw new ApiError(retryResponse.status, await retryResponse.text());
        }
        return retryResponse.json();
      } else {
        localStorage.removeItem("access_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new ApiError(401, "Session expired");
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let detail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        detail = errorJson.detail || errorText;
      } catch {}
      throw new ApiError(response.status, detail);
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // --- Auth ---
  async register(data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    craft_specialty?: string;
    bio?: string;
  }) {
    return this.request<{
      access_token: string;
      user: import("@/types").User;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{
      access_token: string;
      user: import("@/types").User;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<import("@/types").User>("/auth/me");
  }

  async logout() {
    return this.request<{ message: string }>("/auth/logout", { method: "POST" });
  }

  // --- Products ---
  async getProducts(params?: {
    page?: number;
    per_page?: number;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.per_page) searchParams.set("per_page", String(params.per_page));
    if (params?.category) searchParams.set("category", params.category);
    const qs = searchParams.toString();
    return this.request<import("@/types").ProductListResponse>(
      `/products${qs ? `?${qs}` : ""}`
    );
  }

  async getProductBySlug(slug: string) {
    return this.request<import("@/types").Product>(`/products/${slug}`);
  }

  async createProduct(data: import("@/types").ProductCreate) {
    return this.request<import("@/types").Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<import("@/types").ProductCreate>) {
    return this.request<import("@/types").Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async aiCatalogue(files: File[], keywords?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    if (keywords) formData.append("artisan_keywords", keywords);
    return this.request<import("@/types").AICatalogueResponse>(
      "/products/ai-catalogue",
      { method: "POST", body: formData }
    );
  }

  async regenerateField(productId: string, field: string, context?: string) {
    return this.request<{ field: string; value: string }>(
      `/products/${productId}/regenerate`,
      {
        method: "POST",
        body: JSON.stringify({ field, context }),
      }
    );
  }

  // --- Search ---
  async search(params: {
    q?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    per_page?: number;
    sort_by?: string;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    return this.request<import("@/types").SearchResponse>(
      `/search?${searchParams.toString()}`
    );
  }

  // --- Artisan ---
  async getMyProducts(params?: { page?: number; status_filter?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.status_filter) searchParams.set("status_filter", params.status_filter);
    const qs = searchParams.toString();
    return this.request<import("@/types").ProductListResponse>(
      `/artisans/me/products${qs ? `?${qs}` : ""}`
    );
  }

  async getMyEnquiries() {
    return this.request<{
      enquiries: import("@/types").Enquiry[];
      total: number;
    }>("/artisans/me/enquiries");
  }

  async getMyAnalytics() {
    return this.request<Record<string, unknown>>("/artisans/me/analytics");
  }

  async replyToEnquiry(enquiryId: string, response_message: string, status: string) {
    return this.request(`/artisans/enquiries/${enquiryId}/reply`, {
      method: "PUT",
      body: JSON.stringify({ response_message, status }),
    });
  }

  // --- Users ---
  async getProfile() {
    return this.request<Record<string, unknown>>("/users/me");
  }

  async updateProfile(data: Record<string, unknown>) {
    return this.request("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getMySentEnquiries() {
    return this.request<{
      enquiries: import("@/types").Enquiry[];
      total: number;
    }>("/users/me/enquiries");
  }

  // --- Admin ---
  async getAdminUsers(params?: { page?: number; role?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.role) searchParams.set("role", params.role);
    const qs = searchParams.toString();
    return this.request<{
      users: import("@/types").User[];
      total: number;
    }>(`/admin/users${qs ? `?${qs}` : ""}`);
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    return this.request(`/admin/users/${userId}/status?is_active=${isActive}`, {
      method: "PUT",
    });
  }

  async getModerationQueue() {
    return this.request<{ items: Record<string, unknown>[]; total: number }>(
      "/admin/moderation"
    );
  }

  async moderateProduct(productId: string, action: string, reason?: string) {
    const params = new URLSearchParams({ action });
    if (reason) params.set("reason", reason);
    return this.request(`/admin/products/${productId}/moderate?${params}`, {
      method: "PUT",
    });
  }

  async getAdminAnalytics() {
    return this.request<import("@/types").AdminAnalytics>("/admin/analytics");
  }

  // --- Health ---
  async healthCheck() {
    return this.request<{ status: string }>("/health");
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const api = new ApiClient(API_URL);
