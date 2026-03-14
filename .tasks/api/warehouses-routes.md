# Warehouse API Routes

## GET /api/warehouses
List all warehouses.

### Headers
```
Authorization: Bearer <token>
```

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Main Warehouse",
      "short_code": "WH",
      "address": "123 Main St, City",
      "is_active": true,
      "locations_count": 5,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## POST /api/warehouses
Create a new warehouse.

### Request
```json
{
  "name": "Main Warehouse",
  "short_code": "WH",
  "address": "123 Main St, City"
}
```

### Response 201
```json
{
  "id": "uuid",
  "name": "Main Warehouse",
  "short_code": "WH",
  "address": "123 Main St, City",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## GET /api/warehouses/:id
Get warehouse details with locations.

### Response 200
```json
{
  "id": "uuid",
  "name": "Main Warehouse",
  "short_code": "WH",
  "address": "123 Main St, City",
  "is_active": true,
  "locations": [
    {
      "id": "uuid",
      "name": "Room A",
      "short_code": "RA"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## PUT /api/warehouses/:id
Update warehouse.

### Request
```json
{
  "name": "Updated Warehouse",
  "address": "456 New St, City"
}
```

---

## DELETE /api/warehouses/:id
Delete warehouse (only if no stocks exist).

### Response 200
```json
{
  "message": "Warehouse deleted successfully"
}
```

---

## GET /api/warehouses/:id/stats
Get warehouse statistics.

### Response 200
```json
{
  "total_products": 150,
  "total_stock_value": 500000,
  "locations_count": 5,
  "pending_receipts": 3,
  "pending_deliveries": 2
}
```
