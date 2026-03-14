# CoreInventory Database Structure

## Overview
Production-level database schema for the inventory management system with proper indexes, relations, and constraints.

## Entity Relationship Diagram

```
┌──────────┐     ┌─────────────┐     ┌──────────┐
│  Users   │────<│  Warehouses │────<│Locations │
└──────────┘     └─────────────┘     └──────────┘
                       │
                       │
                 ┌─────┴─────┐
                 │   Stocks  │
                 └─────┬─────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │Receipts │    │Deliveries│   │Products │
   └────┬────┘    └────┬────┘    └──────────┘
        │              │
   ┌────▼────┐    ┌────▼────┐
   │Receipt  │    │Delivery │
   │ Items   │    │  Items  │
   └─────────┘    └─────────┘
```

## Tables

### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. warehouses
```sql
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouses_short_code ON warehouses(short_code);
```

### 3. locations
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  short_code VARCHAR(50) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(warehouse_id, short_code)
);

CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);
```

### 4. products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  unit_cost DECIMAL(12, 2) DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'piece',
  category VARCHAR(100),
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
```

### 5. stocks
```sql
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  on_hand INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, warehouse_id, location_id)
);

CREATE INDEX idx_stocks_product ON stocks(product_id);
CREATE INDEX idx_stocks_warehouse ON stocks(warehouse_id);
CREATE INDEX idx_stocks_location ON stocks(location_id);
```

### 6. receipts
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  vendor VARCHAR(255),
  warehouse_id UUID REFERENCES warehouses(id),
  location_id UUID REFERENCES locations(id),
  responsible VARCHAR(255),
  contact VARCHAR(255),
  schedule_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_reference ON receipts(reference);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_warehouse ON receipts(warehouse_id);
CREATE INDEX idx_receipts_schedule_date ON receipts(schedule_date);
```

### 7. receipt_items
```sql
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product ON receipt_items(product_id);
```

### 8. deliveries
```sql
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(50) UNIQUE NOT NULL,
  destination VARCHAR(255),
  warehouse_id UUID REFERENCES warehouses(id),
  location_id UUID REFERENCES locations(id),
  responsible VARCHAR(255),
  contact VARCHAR(255),
  schedule_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliveries_reference ON deliveries(reference);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_warehouse ON deliveries(warehouse_id);
CREATE INDEX idx_deliveries_schedule_date ON deliveries(schedule_date);
```

### 9. delivery_items
```sql
CREATE TABLE delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_items_delivery ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_product ON delivery_items(product_id);
```

### 10. stock_moves
```sql
CREATE TABLE stock_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  move_type VARCHAR(50) NOT NULL,
  from_warehouse_id UUID REFERENCES warehouses(id),
  from_location_id UUID REFERENCES locations(id),
  to_warehouse_id UUID REFERENCES warehouses(id),
  to_location_id UUID REFERENCES locations(id),
  operation_id UUID,
  operation_type VARCHAR(50),
  reference VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_moves_product ON stock_moves(product_id);
CREATE INDEX idx_stock_moves_type ON stock_moves(move_type);
CREATE INDEX idx_stock_moves_created_at ON stock_moves(created_at);
CREATE INDEX idx_stock_moves_operation ON stock_moves(operation_id, operation_type);
```

## Reference Number Logic

### Format: WH/OP/XXXX

| Component | Description |
|-----------|-------------|
| WH | Warehouse short code |
| OP | Operation type (IN=Receipt, OUT=Delivery) |
| XXXX | Sequential number (padded with zeros) |

### Examples
- `WH/IN/0001` - Receipt #1
- `WH/OUT/0001` - Delivery #1

### Sequence Functions
```sql
CREATE FUNCTION generate_receipt_reference(warehouse_short_code TEXT)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  ref TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 8 FOR 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM receipts
  WHERE reference LIKE warehouse_short_code || '/IN/%';
  
  ref := warehouse_short_code || '/IN/' || LPAD(next_num::TEXT, 4, '0');
  RETURN ref;
END;
$$ LANGUAGE plpgsql;
```

## Status Workflows

### Receipt Status Flow
```
draft → ready → done
```

| Status | Description | Editable |
|--------|-------------|----------|
| draft | Initial state | Yes |
| ready | Waiting for stock arrival | No |
| done | Stock has been added | No |

### Delivery Status Flow
```
draft → waiting → ready → done
```

| Status | Description | Editable |
|--------|-------------|----------|
| draft | Initial state | Yes |
| waiting | Stock not available yet | No |
| ready | Stock is available | No |
| done | Stock has been shipped | No |

## Indexes Summary

| Table | Index Name | Columns |
|-------|------------|---------|
| users | idx_users_email | email |
| users | idx_users_role | role |
| warehouses | idx_warehouses_short_code | short_code |
| locations | idx_locations_warehouse | warehouse_id |
| products | idx_products_sku | sku |
| products | idx_products_category | category |
| stocks | idx_stocks_product | product_id |
| stocks | idx_stocks_warehouse | warehouse_id |
| stocks | idx_stocks_location | location_id |
| receipts | idx_receipts_reference | reference |
| receipts | idx_receipts_status | status |
| receipts | idx_receipts_warehouse | warehouse_id |
| receipts | idx_receipts_schedule_date | schedule_date |
| deliveries | idx_deliveries_reference | reference |
| deliveries | idx_deliveries_status | status |
| deliveries | idx_deliveries_warehouse | warehouse_id |
| deliveries | idx_deliveries_schedule_date | schedule_date |
| stock_moves | idx_stock_moves_product | product_id |
| stock_moves | idx_stock_moves_type | move_type |
| stock_moves | idx_stock_moves_created_at | created_at |

## Views

### Stock Summary View
```sql
CREATE VIEW v_stock_summary AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.sku,
  p.unit_cost,
  p.unit,
  w.id as warehouse_id,
  w.name as warehouse_name,
  w.short_code,
  COALESCE(SUM(s.on_hand), 0) as on_hand,
  COALESCE(SUM(s.reserved), 0) as reserved,
  COALESCE(SUM(s.on_hand), 0) - COALESCE(SUM(s.reserved), 0) as free_to_use
FROM products p
LEFT JOIN stocks s ON p.id = s.product_id
LEFT JOIN warehouses w ON s.warehouse_id = w.id
GROUP BY p.id, w.id;
```

### Dashboard Stats View
```sql
CREATE VIEW v_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM receipts WHERE status = 'draft' OR status = 'ready') as receipts_pending,
  (SELECT COUNT(*) FROM receipts WHERE status = 'ready' AND schedule_date < CURRENT_DATE) as receipts_late,
  (SELECT COUNT(*) FROM deliveries WHERE status = 'draft' OR status = 'waiting' OR status = 'ready') as deliveries_pending,
  (SELECT COUNT(*) FROM deliveries WHERE status = 'waiting' OR status = 'ready') as deliveries_waiting;
```
