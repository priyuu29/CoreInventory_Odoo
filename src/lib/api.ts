import {
  type DashboardStats,
  type Delivery,
  type DeliveryFilters,
  DeliveryItem,
  type Location,
  type LoginFormData,
  type MoveFilters,
  type PaginatedResponse,
  type Product,
  type Receipt,
  type ReceiptFilters,
  ReceiptItem,
  type RegisterFormData,
  type Stock,
  type StockFilters,
  type StockMove,
  type User,
  type Warehouse,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
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

  logout: (): Promise<void> => fetchApi<void>("/auth/logout", { method: "POST" }),
};

export const dashboardApi = {
  getStats: (): Promise<DashboardStats> => fetchApi<DashboardStats>("/dashboard/stats"),
};

export const receiptsApi = {
  list: (filters?: ReceiptFilters): Promise<PaginatedResponse<Receipt>> =>
    fetchApi<PaginatedResponse<Receipt>>(`/receipts${buildQueryString(filters)}`),

  get: (id: string): Promise<Receipt> => fetchApi<Receipt>(`/receipts/${id}`),

  create: (data: Partial<Receipt>): Promise<Receipt> =>
    fetchApi<Receipt>("/receipts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Receipt>): Promise<Receipt> =>
    fetchApi<Receipt>(`/receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/receipts/${id}`, { method: "DELETE" }),

  validate: (id: string): Promise<Receipt> =>
    fetchApi<Receipt>(`/receipts/${id}/validate`, { method: "POST" }),

  complete: (id: string): Promise<Receipt> =>
    fetchApi<Receipt>(`/receipts/${id}/complete`, { method: "POST" }),
};

export const deliveriesApi = {
  list: (filters?: DeliveryFilters): Promise<PaginatedResponse<Delivery>> =>
    fetchApi<PaginatedResponse<Delivery>>(`/deliveries${buildQueryString(filters)}`),

  get: (id: string): Promise<Delivery> => fetchApi<Delivery>(`/deliveries/${id}`),

  create: (data: Partial<Delivery>): Promise<Delivery> =>
    fetchApi<Delivery>("/deliveries", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Delivery>): Promise<Delivery> =>
    fetchApi<Delivery>(`/deliveries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/deliveries/${id}`, { method: "DELETE" }),

  validate: (id: string): Promise<Delivery> =>
    fetchApi<Delivery>(`/deliveries/${id}/validate`, { method: "POST" }),

  complete: (id: string): Promise<Delivery> =>
    fetchApi<Delivery>(`/deliveries/${id}/complete`, { method: "POST" }),
};

export const stocksApi = {
  list: (filters?: StockFilters): Promise<PaginatedResponse<Stock>> =>
    fetchApi<PaginatedResponse<Stock>>(`/stocks${buildQueryString(filters)}`),

  get: (productId: string): Promise<Stock> => fetchApi<Stock>(`/stocks/${productId}`),

  getLowStock: (): Promise<{ data: Stock[] }> => fetchApi<{ data: Stock[] }>("/stocks/low"),
};

export const warehousesApi = {
  list: (): Promise<{ data: Warehouse[] }> => fetchApi<{ data: Warehouse[] }>("/warehouses"),

  get: (id: string): Promise<Warehouse> => fetchApi<Warehouse>(`/warehouses/${id}`),

  create: (data: Partial<Warehouse>): Promise<Warehouse> =>
    fetchApi<Warehouse>("/warehouses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Warehouse>): Promise<Warehouse> =>
    fetchApi<Warehouse>(`/warehouses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/warehouses/${id}`, { method: "DELETE" }),
};

export const locationsApi = {
  list: (warehouseId?: string): Promise<{ data: Location[] }> => {
    const qs = warehouseId ? `?warehouse_id=${warehouseId}` : "";
    return fetchApi<{ data: Location[] }>(`/locations${qs}`);
  },

  get: (id: string): Promise<Location> => fetchApi<Location>(`/locations/${id}`),

  create: (data: Partial<Location>): Promise<Location> =>
    fetchApi<Location>("/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Location>): Promise<Location> =>
    fetchApi<Location>(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> => fetchApi<void>(`/locations/${id}`, { method: "DELETE" }),
};

export const productsApi = {
  list: (search?: string): Promise<PaginatedResponse<Product>> =>
    fetchApi<PaginatedResponse<Product>>(`/products${buildQueryString({ search })}`),

  get: (id: string): Promise<Product> => fetchApi<Product>(`/products/${id}`),
};

export const movesApi = {
  list: (filters?: MoveFilters): Promise<PaginatedResponse<StockMove>> =>
    fetchApi<PaginatedResponse<StockMove>>(`/moves${buildQueryString(filters)}`),
};

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  receipts: {
    all: ["receipts"] as const,
    list: (filters?: ReceiptFilters) => ["receipts", filters] as const,
    detail: (id: string) => ["receipts", id] as const,
  },
  deliveries: {
    all: ["deliveries"] as const,
    list: (filters?: DeliveryFilters) => ["deliveries", filters] as const,
    detail: (id: string) => ["deliveries", id] as const,
  },
  stocks: {
    list: (filters?: StockFilters) => ["stocks", filters] as const,
    lowStock: ["stocks", "low"] as const,
  },
  warehouses: {
    all: ["warehouses"] as const,
    list: ["warehouses"] as const,
    detail: (id: string) => ["warehouses", id] as const,
  },
  locations: {
    all: ["locations"] as const,
    list: (warehouseId?: string) => ["locations", warehouseId] as const,
  },
  products: {
    list: (search?: string) => ["products", search] as const,
  },
  moves: {
    list: (filters?: MoveFilters) => ["moves", filters] as const,
  },
};
