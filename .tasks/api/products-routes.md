# Products API Routes

## GET /api/products
List all products.

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| search | string | Search name/SKU |
| category | string | Filter by category |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Desk",
      "sku": "DESK-001",
      "description": "Office desk",
      "unit_cost": 3000,
      "unit": "piece",
      "category": "Furniture",
      "image_url": "https://...",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5,
    "total": 100
  }
}
```

---

## POST /api/products
Create a new product.

### Request
```json
{
  "name": "Desk",
  "sku": "DESK-001",
  "description": "Office desk",
  "unit_cost": 3000,
  "unit": "piece",
  "category": "Furniture",
  "image_url": "https://..."
}
```

### Response 201
```json
{
  "id": "uuid",
  "name": "Desk",
  "sku": "DESK-001",
  "description": "Office desk",
  "unit_cost": 3000,
  "unit": "piece",
  "category": "Furniture",
  "image_url": "https://...",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## GET /api/products/:id
Get product details with stock.

### Response 200
```json
{
  "id": "uuid",
  "name": "Desk",
  "sku": "DESK-001",
  "description": "Office desk",
  "unit_cost": 3000,
  "unit": "piece",
  "category": "Furniture",
  "image_url": "https://...",
  "is_active": true,
  "stocks": [
    {
      "warehouse": {
        "id": "uuid",
        "name": "Main Warehouse"
      },
      "on_hand": 50,
      "free_to_use": 45
    }
  ],
  "total_stock": {
    "on_hand": 50,
    "free_to_use": 45
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## PUT /api/products/:id
Update product.

---

## DELETE /api/products/:id
Delete product (only if no stock exists).

---

## GET /api/products/search
Search products for autocomplete.

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Desk",
      "sku": "DESK-001",
      "unit_cost": 3000
    }
  ]
}
```

---

## GET /api/products/categories
Get all product categories.

### Response 200
```json
{
  "data": ["Furniture", "Electronics", "Office Supplies"]
}
```
