/* ============================================================
   KalaSetu — Types matching backend Pydantic schemas
   ============================================================ */

// --- Auth ---
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "artisan" | "buyer" | "admin";
  is_active: boolean;
  avatar_url?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: "artisan" | "buyer";
  craft_specialty?: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Product ---
export interface Product {
  id: string;
  artisan_id: number;
  title: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number;
  ai_suggested_price_min?: number;
  ai_suggested_price_max?: number;
  ai_generated_fields?: Record<string, boolean>;
  images: Array<string | { url: string; thumbnail?: string }>;
  slug: string;
  seo_meta?: { title?: string; description?: string };
  status: "draft" | "published" | "sold" | "flagged";
  view_count: number;
  enquiry_count: number;
  created_at: string;
  updated_at: string;
  artisan_name?: string;
  artisan_location?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface AICatalogueResponse {
  title: string;
  description: string;
  short_description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  seo_meta_description: string;
  suggested_price_min: number;
  suggested_price_max: number;
  suggested_price: number;
  price_rationale: string;
  detected_materials: string[];
  detected_colors: string[];
  style_tags: string[];
  images: string[];
}

export interface ProductCreate {
  title: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number;
  images: string[];
  status: "draft" | "published";
  seo_meta?: Record<string, string>;
  ai_generated_fields?: Record<string, boolean>;
  ai_suggested_price_min?: number;
  ai_suggested_price_max?: number;
}

// --- Search ---
export interface SearchResult {
  id: string;
  title: string;
  short_description?: string;
  category: string;
  price: number;
  images: Array<string | { url: string; thumbnail?: string }>;
  slug: string;
  artisan_name?: string;
  artisan_location?: string;
  relevance_score: number;
  match_reason?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  query: string;
  suggestions: string[];
}

// --- Enquiry ---
export interface Enquiry {
  id: string;
  product_id: string;
  product_title?: string;
  buyer_id: number;
  buyer_name?: string;
  type: "enquiry" | "order";
  status: string;
  message?: string;
  response_message?: string;
  created_at: string;
}

// --- Artisan ---
export interface ArtisanProfile {
  id: number;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  craft_specialty?: string;
  address?: string;
  rating: number;
  total_sales: number;
  is_verified: boolean;
  product_count: number;
}

// --- Admin ---
export interface AdminAnalytics {
  total_users: number;
  total_artisans: number;
  total_buyers: number;
  total_products: number;
  published_products: number;
  total_views: number;
  total_enquiries: number;
  total_transactions: number;
  category_breakdown: Record<string, number>;
  ai_pipeline_health: Record<string, string>;
}
