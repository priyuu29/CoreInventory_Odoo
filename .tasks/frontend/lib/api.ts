// API Configuration and React Query Hooks
import type {
  DashboardStats,
  Delivery,
  DeliveryFilters,
  DeliveryFormData,
  DeliveryItem,
  DeliveryItemFormData,
  Location,
  LocationFormData,
  LoginFormData,
  MoveFilters,
  PaginatedResponse,
  Product,
  Receipt,
  ReceiptFilters,
  ReceiptFormData,
  ReceiptItem,
  ReceiptItemFormData,
  RegisterFormData,
  Stock,
  StockFilters,
  StockMove,
  User,
  Warehouse,
  WarehouseFormData,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// ============================================
// API Helper
// ============================================
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "An error occurred" }));
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

function buildQueryString<T extends object>(filters?: T): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== null) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ============================================
// Auth Hooks
// ============================================
export const authApi = {
  login: (data: LoginFormData): Promise<{ token: string; user: User }> =>
    fetchApi<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterFormData): Promise<{ message: string; user: User }> =>
    fetchApi<{ message: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (): Promise<User> => fetchApi<User>("/auth/me"),

  logout: (): Promise<void> => Promise.resolve(),
};

// ============================================
// Dashboard Hooks
// ============================================
export const dashboardApi = {
  getStats: (): Promise<DashboardStats> => fetchApi<DashboardStats>("/dashboard/stats"),
};

// ============================================
// Receipt Hooks
// ============================================
export const receiptsApi = {
  list: (filters?: ReceiptFilters): Promise<PaginatedResponse<Receipt>> =>
    fetchApi<PaginatedResponse<Receipt>>(`/receipts${buildQueryString(filters)}`),

  get: (id: string): Promise<Receipt> => fetchApi<Receipt>(`/receipts/${id}`),

  create: (data: ReceiptFormData): Promise<Receipt> =>
    fetchApi<Receipt>("/receipts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ReceiptFormData>): Promise<Receipt> =>
    fetchApi<Receipt>(`/receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/receipts/${id}`, { method: "DELETE" }),

  validate: (id: string): Promise<Receipt> =>
    fetchApi<Receipt>(`/receipts/${id}/validate`, { method: "POST" }),

  complete: (id: string): Promise<Receipt> =>
    fetchApi<Receipt>(`/receipts/${id}/complete`, { method: "POST" }),

  addItem: (receiptId: string, data: ReceiptItemFormData): Promise<ReceiptItem> =>
    fetchApi<ReceiptItem>(`/receipts/${receiptId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeItem: (receiptId: string, itemId: string): Promise<void> =>
    fetchApi<void>(`/receipts/${receiptId}/items/${itemId}`, { method: "DELETE" }),
};

// ============================================
// Delivery Hooks
// ============================================
export const deliveriesApi = {
  list: (filters?: DeliveryFilters): Promise<PaginatedResponse<Delivery>> =>
    fetchApi<PaginatedResponse<Delivery>>(`/deliveries${buildQueryString(filters)}`),

  get: (id: string): Promise<Delivery> => fetchApi<Delivery>(`/deliveries/${id}`),

  create: (data: DeliveryFormData): Promise<Delivery> =>
    fetchApi<Delivery>("/deliveries", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<DeliveryFormData>): Promise<Delivery> =>
    fetchApi<Delivery>(`/deliveries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/deliveries/${id}`, { method: "DELETE" }),

  checkStock: (
    id: string,
  ): Promise<{
    all_available: boolean;
    items: Array<{ item_id: string; is_available: boolean }>;
  }> =>
    fetchApi<{ all_available: boolean; items: Array<{ item_id: string; is_available: boolean }> }>(
      `/deliveries/${id}/check-stock`,
      { method: "POST" },
    ),

  validate: (id: string): Promise<Delivery> =>
    fetchApi<Delivery>(`/deliveries/${id}/validate`, { method: "POST" }),

  complete: (id: string): Promise<Delivery> =>
    fetchApi<Delivery>(`/deliveries/${id}/complete`, { method: "POST" }),

  addItem: (deliveryId: string, data: DeliveryItemFormData): Promise<DeliveryItem> =>
    fetchApi<DeliveryItem>(`/deliveries/${deliveryId}/items`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeItem: (deliveryId: string, itemId: string): Promise<void> =>
    fetchApi<void>(`/deliveries/${deliveryId}/items/${itemId}`, { method: "DELETE" }),
};

// ============================================
// Stock Hooks
// ============================================
export const stocksApi = {
  list: (filters?: StockFilters): Promise<PaginatedResponse<Stock>> =>
    fetchApi<PaginatedResponse<Stock>>(`/stocks${buildQueryString(filters)}`),

  get: (productId: string): Promise<Stock> => fetchApi<Stock>(`/stocks/${productId}`),

  adjust: (data: {
    product_id: string;
    warehouse_id: string;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<Stock> =>
    fetchApi<Stock>("/stocks/adjust", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getLowStock: (): Promise<{ data: Stock[] }> => fetchApi<{ data: Stock[] }>("/stocks/low"),
};

// ============================================
// Warehouse Hooks
// ============================================
export const warehousesApi = {
  list: (): Promise<{ data: Warehouse[] }> => fetchApi<{ data: Warehouse[] }>("/warehouses"),

  get: (id: string): Promise<Warehouse> => fetchApi<Warehouse>(`/warehouses/${id}`),

  create: (data: WarehouseFormData): Promise<Warehouse> =>
    fetchApi<Warehouse>("/warehouses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<WarehouseFormData>): Promise<Warehouse> =>
    fetchApi<Warehouse>(`/warehouses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/warehouses/${id}`, { method: "DELETE" }),

  getStats: (
    id: string,
  ): Promise<{
    total_products: number;
    total_stock_value: number;
    locations_count: number;
    pending_receipts: number;
    pending_deliveries: number;
  }> =>
    fetchApi<{
      total_products: number;
      total_stock_value: number;
      locations_count: number;
      pending_receipts: number;
      pending_deliveries: number;
    }>(`/warehouses/${id}/stats`),
};

// ============================================
// Location Hooks
// ============================================
export const locationsApi = {
  list: (warehouseId?: string): Promise<{ data: Location[] }> => {
    const qs = warehouseId ? `?warehouse_id=${warehouseId}` : "";
    return fetchApi<{ data: Location[] }>(`/locations${qs}`);
  },

  get: (id: string): Promise<Location> => fetchApi<Location>(`/locations/${id}`),

  create: (data: LocationFormData): Promise<Location> =>
    fetchApi<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<LocationFormData>): Promise<Location> =>
    fetchApi<Location>(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/locations/${id}`, { method: "DELETE" }),

  getByWarehouse: (warehouseId: string): Promise<{ data: Location[] }> =>
    fetchApi<{ data: Location[] }>(`/locations/warehouse/${warehouseId}`),
};

// ============================================
// Product Hooks
// ============================================
export const productsApi = {
  list: (search?: string, category?: string): Promise<PaginatedResponse<Product>> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    return fetchApi<PaginatedResponse<Product>>(`/products${buildQueryString(params)}`);
  },

  get: (id: string): Promise<Product> => fetchApi<Product>(`/products/${id}`),

  create: (data: Partial<Product>): Promise<Product> =>
    fetchApi<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Product>): Promise<Product> =>
    fetchApi<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/products/${id}`, { method: "DELETE" }),

  search: (query: string): Promise<{ data: Product[] }> =>
    fetchApi<{ data: Product[] }>(`/products/search?q=${query}`),

  getCategories: (): Promise<{ data: string[] }> =>
    fetchApi<{ data: string[] }>("/products/categories"),
};

// ============================================
// Move Hooks
// ============================================
export const movesApi = {
  list: (filters?: MoveFilters): Promise<PaginatedResponse<StockMove>> =>
    fetchApi<PaginatedResponse<StockMove>>(`/moves${buildQueryString(filters)}`),

  get: (id: string): Promise<StockMove> => fetchApi<StockMove>(`/moves/${id}`),

  getByProduct: (
    productId: string,
  ): Promise<{
    product: Product;
    moves: StockMove[];
    summary: { total_in: number; total_out: number; current_stock: number };
  }> =>
    fetchApi<{
      product: Product;
      moves: StockMove[];
      summary: { total_in: number; total_out: number; current_stock: number };
    }>(`/moves/product/${productId}`),
};

// ============================================
// Query Keys
// ============================================
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  receipts: {
    list: (filters?: ReceiptFilters) => ["receipts", filters] as const,
    detail: (id: string) => ["receipts", id] as const,
  },
  deliveries: {
    list: (filters?: DeliveryFilters) => ["deliveries", filters] as const,
    detail: (id: string) => ["deliveries", id] as const,
  },
  stocks: {
    list: (filters?: StockFilters) => ["stocks", filters] as const,
    detail: (productId: string) => ["stocks", productId] as const,
    lowStock: ["stocks", "low"] as const,
  },
  warehouses: {
    list: ["warehouses"] as const,
    detail: (id: string) => ["warehouses", id] as const,
  },
  locations: {
    list: (warehouseId?: string) => ["locations", warehouseId] as const,
    detail: (id: string) => ["locations", id] as const,
  },
  products: {
    list: (search?: string) => ["products", search] as const,
    detail: (id: string) => ["products", id] as const,
    search: (query: string) => ["products", "search", query] as const,
    categories: ["products", "categories"] as const,
  },
  moves: {
    list: (filters?: MoveFilters) => ["moves", filters] as const,
    detail: (id: string) => ["moves", id] as const,
    byProduct: (productId: string) => ["moves", "product", productId] as const,
  },
};
