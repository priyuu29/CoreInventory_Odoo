// CoreInventory TypeScript Types

// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// Warehouse & Location Types
// ============================================
export interface Warehouse {
  id: string;
  name: string;
  short_code: string;
  address?: string;
  is_active: boolean;
  locations_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  short_code: string;
  warehouse: Warehouse;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Product & Stock Types
// ============================================
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  unit_cost: number;
  unit: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: string;
  product: Product;
  warehouse: Warehouse;
  location?: Location;
  on_hand: number;
  reserved: number;
  free_to_use: number;
}

export interface StockSummary {
  product: Product;
  warehouses: {
    warehouse: Warehouse;
    on_hand: number;
    reserved: number;
    free_to_use: number;
  }[];
  total: {
    on_hand: number;
    reserved: number;
    free_to_use: number;
  };
}

// ============================================
// Receipt Types
// ============================================
export type ReceiptStatus = "draft" | "ready" | "done";

export interface ReceiptItem {
  id: string;
  product: Product;
  quantity: number;
  unit_cost?: number;
  notes?: string;
}

export interface Receipt {
  id: string;
  reference: string;
  vendor?: string;
  warehouse: Warehouse;
  location?: Location;
  responsible?: string;
  contact?: string;
  schedule_date?: string;
  status: ReceiptStatus;
  notes?: string;
  items: ReceiptItem[];
  created_by: User;
  validated_by?: User;
  validated_at?: string;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Delivery Types
// ============================================
export type DeliveryStatus = "draft" | "waiting" | "ready" | "done";

export interface DeliveryItem {
  id: string;
  product: Product;
  quantity: number;
  available_stock?: number;
  is_available?: boolean;
  notes?: string;
}

export interface Delivery {
  id: string;
  reference: string;
  destination?: string;
  warehouse: Warehouse;
  location?: Location;
  responsible?: string;
  contact?: string;
  schedule_date?: string;
  status: DeliveryStatus;
  notes?: string;
  items: DeliveryItem[];
  created_by: User;
  validated_by?: User;
  validated_at?: string;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Stock Move Types
// ============================================
export type MoveType = "receipt" | "delivery" | "adjustment";

export interface StockMove {
  id: string;
  product: Product;
  quantity: number;
  move_type: MoveType;
  from_warehouse?: Warehouse;
  from_location?: Location;
  to_warehouse?: Warehouse;
  to_location?: Location;
  operation_id?: string;
  operation_type?: string;
  reference?: string;
  notes?: string;
  created_by?: User;
  createdAt: string;
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  receipts_pending: number;
  receipts_late: number;
  deliveries_pending: number;
  deliveries_waiting: number;
  recent_receipts: Receipt[];
  recent_deliveries: Delivery[];
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total: number;
    limit: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// ============================================
// Form Types
// ============================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ReceiptFormData {
  vendor?: string;
  warehouse_id: string;
  location_id?: string;
  responsible?: string;
  contact?: string;
  schedule_date?: string;
  notes?: string;
}

export interface DeliveryFormData {
  destination?: string;
  warehouse_id: string;
  location_id?: string;
  responsible?: string;
  contact?: string;
  schedule_date?: string;
  notes?: string;
}

export interface WarehouseFormData {
  name: string;
  short_code: string;
  address?: string;
}

export interface LocationFormData {
  name: string;
  short_code: string;
  warehouse_id: string;
  description?: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  description?: string;
  unit_cost: number;
  unit: string;
  category?: string;
  image_url?: string;
}

export interface ReceiptItemFormData {
  product_id: string;
  quantity: number;
  unit_cost?: number;
  notes?: string;
}

export interface DeliveryItemFormData {
  product_id: string;
  quantity: number;
  notes?: string;
}

// ============================================
// Filter Types
// ============================================
export interface ReceiptFilters {
  page?: number;
  limit?: number;
  status?: ReceiptStatus | "all";
  warehouse_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface DeliveryFilters {
  page?: number;
  limit?: number;
  status?: DeliveryStatus | "all";
  warehouse_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  warehouse_id?: string;
  location_id?: string;
  search?: string;
  low_stock?: boolean;
}

export interface MoveFilters {
  page?: number;
  limit?: number;
  product_id?: string;
  move_type?: MoveType | "all";
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================
// Status Badge Type
// ============================================
export type StatusType = ReceiptStatus | DeliveryStatus | "late";

export interface StatusConfig {
  label: string;
  variant: "neutral" | "brand" | "success" | "warning" | "danger";
  background: string;
}

export const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  draft: { label: "Draft", variant: "neutral", background: "neutral-alpha-weak" },
  waiting: { label: "Waiting", variant: "warning", background: "warning-alpha-weak" },
  ready: { label: "Ready", variant: "brand", background: "brand-alpha-weak" },
  done: { label: "Done", variant: "success", background: "success-alpha-weak" },
  late: { label: "Late", variant: "danger", background: "danger-alpha-weak" },
};
