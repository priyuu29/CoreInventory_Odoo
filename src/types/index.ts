// CoreInventory TypeScript Types

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

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

export type ReceiptStatus = "draft" | "ready" | "done";
export type DeliveryStatus = "draft" | "waiting" | "ready" | "done";
export type MoveType = "receipt" | "delivery" | "adjustment";

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

export interface DashboardStats {
  receipts_pending: number;
  receipts_late: number;
  deliveries_pending: number;
  deliveries_waiting: number;
  recent_receipts: Receipt[];
  recent_deliveries: Delivery[];
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
  search?: string;
  product_id?: string;
  move_type?: MoveType | "all";
  warehouse_id?: string;
  date_from?: string;
  date_to?: string;
}
