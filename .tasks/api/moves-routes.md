# Stock Moves API Routes

## GET /api/moves
List all stock movements.

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| product_id | uuid | Filter by product |
| move_type | string | Filter by type (receipt/delivery/adjustment) |
| warehouse_id | uuid | Filter by warehouse |
| date_from | date | Filter from date |
| date_to | date | Filter to date |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Desk",
        "sku": "DESK-001"
      },
      "quantity": 10,
      "move_type": "receipt",
      "from_warehouse": null,
      "from_location": null,
      "to_warehouse": {
        "id": "uuid",
        "name": "Main Warehouse"
      },
      "to_location": {
        "id": "uuid",
        "name": "Room A"
      },
      "reference": "WH/IN/0001",
      "operation_type": "receipt",
      "operation_id": "uuid",
      "created_by": {
        "id": "uuid",
        "name": "John Doe"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 20,
    "total": 400
  }
}
```

---

## GET /api/moves/:id
Get stock move details.

### Response 200
```json
{
  "id": "uuid",
  "product": {
    "id": "uuid",
    "name": "Desk",
    "sku": "DESK-001"
  },
  "quantity": 10,
  "move_type": "delivery",
  "from_warehouse": {
    "id": "uuid",
    "name": "Main Warehouse"
  },
  "from_location": {
    "id": "uuid",
    "name": "Room A"
  },
  "to_warehouse": null,
  "to_location": null,
  "reference": "WH/OUT/0001",
  "operation_type": "delivery",
  "operation_id": "uuid",
  "notes": "Delivered to customer",
  "created_by": {
    "id": "uuid",
    "name": "John Doe"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## GET /api/moves/product/:productId
Get movement history for specific product.

### Response 200
```json
{
  "product": {
    "id": "uuid",
    "name": "Desk",
    "sku": "DESK-001"
  },
  "moves": [
    {
      "id": "uuid",
      "quantity": 10,
      "move_type": "receipt",
      "to_warehouse": "Main Warehouse",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "total_in": 100,
    "total_out": 50,
    "current_stock": 50
  }
}
```
