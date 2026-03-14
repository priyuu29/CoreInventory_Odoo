# Stock API Routes

## GET /api/stocks
List all stocks with filters.

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| warehouse_id | uuid | Filter by warehouse |
| location_id | uuid | Filter by location |
| search | string | Search product name/SKU |
| low_stock | boolean | Show only low stock items |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Desk",
        "sku": "DESK-001",
        "unit_cost": 3000,
        "unit": "piece"
      },
      "warehouse": {
        "id": "uuid",
        "name": "Warehouse 1"
      },
      "location": {
        "id": "uuid",
        "name": "Room A"
      },
      "on_hand": 50,
      "reserved": 5,
      "free_to_use": 45
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "total": 200
  }
}
```

---

## GET /api/stocks/:productId
Get stock for specific product across all warehouses.

### Response 200
```json
{
  "product": {
    "id": "uuid",
    "name": "Desk",
    "sku": "DESK-001"
  },
  "warehouses": [
    {
      "warehouse": {
        "id": "uuid",
        "name": "Warehouse 1"
      },
      "on_hand": 50,
      "reserved": 5,
      "free_to_use": 45
    }
  ],
  "total": {
    "on_hand": 50,
    "reserved": 5,
    "free_to_use": 45
  }
}
```

---

## PUT /api/stocks/:id
Update stock quantity manually.

### Request
```json
{
  "on_hand": 60,
  "notes": "Adjustment reason"
}
```

---

## POST /api/stocks/adjust
Adjust stock (create stock move record).

### Request
```json
{
  "product_id": "uuid",
  "warehouse_id": "uuid",
  "location_id": "uuid",
  "quantity": 10,
  "reason": "Inventory count",
  "notes": "Additional notes"
}
```

---

## GET /api/stocks/low
Get low stock alerts.

### Response 200
```json
{
  "data": [
    {
      "product": {
        "id": "uuid",
        "name": "Desk",
        "sku": "DESK-001",
        "min_stock": 10
      },
      "warehouse": {
        "id": "uuid",
        "name": "Warehouse 1"
      },
      "on_hand": 5,
      "free_to_use": 5
    }
  ]
}
```
