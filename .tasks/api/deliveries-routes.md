# Deliveries API Routes

## GET /api/deliveries
List all deliveries with pagination and filters.

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| status | string | Filter by status |
| warehouse_id | uuid | Filter by warehouse |
| search | string | Search in reference/destination |
| date_from | date | Filter from date |
| date_to | date | Filter to date |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "reference": "WH/OUT/0001",
      "destination": "Customer Name",
      "warehouse": "Warehouse 1",
      "contact": "John Doe",
      "schedule_date": "2024-01-15",
      "status": "waiting",
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

## POST /api/deliveries
Create a new delivery.

### Headers
```
Authorization: Bearer <token>
```

### Request
```json
{
  "destination": "Customer Name",
  "warehouse_id": "uuid",
  "location_id": "uuid",
  "responsible": "John Doe",
  "contact": "+1234567890",
  "schedule_date": "2024-01-15",
  "notes": "Optional notes"
}
```

### Response 201
```json
{
  "id": "uuid",
  "reference": "WH/OUT/0001",
  "destination": "Customer Name",
  "warehouse_id": "uuid",
  "status": "draft",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## GET /api/deliveries/:id
Get delivery details with items.

### Response 200
```json
{
  "id": "uuid",
  "reference": "WH/OUT/0001",
  "destination": "Customer Name",
  "warehouse": {
    "id": "uuid",
    "name": "Warehouse 1"
  },
  "location": {
    "id": "uuid",
    "name": "Room A"
  },
  "responsible": "John Doe",
  "contact": "+1234567890",
  "schedule_date": "2024-01-15",
  "status": "waiting",
  "notes": "Optional notes",
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Desk",
        "sku": "DESK-001"
      },
      "quantity": 10,
      "available_stock": 15,
      "is_available": true
    }
  ],
  "created_by": {
    "id": "uuid",
    "name": "John Doe"
  },
  "validated_by": null,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## PUT /api/deliveries/:id
Update delivery details.

---

## DELETE /api/deliveries/:id
Delete a delivery (only if draft).

---

## POST /api/deliveries/:id/items
Add product to delivery.

### Request
```json
{
  "product_id": "uuid",
  "quantity": 10,
  "notes": "Optional notes"
}
```

---

## PUT /api/deliveries/:id/items/:itemId
Update delivery item.

---

## DELETE /api/deliveries/:id/items/:itemId
Remove item from delivery.

---

## POST /api/deliveries/:id/check-stock
Check stock availability for delivery items.

### Response 200
```json
{
  "all_available": true,
  "items": [
    {
      "item_id": "uuid",
      "product_id": "uuid",
      "product_name": "Desk",
      "requested": 10,
      "available": 15,
      "is_available": true
    }
  ]
}
```

---

## POST /api/deliveries/:id/validate
Validate delivery (change status to ready).

### Response 200
```json
{
  "id": "uuid",
  "status": "ready",
  "validated_by": {
    "id": "uuid",
    "name": "John Doe"
  },
  "validated_at": "2024-01-15T11:00:00Z"
}
```

---

## POST /api/deliveries/:id/complete
Complete delivery (change status from ready to done, reduce stock).

### Response 200
```json
{
  "id": "uuid",
  "status": "done",
  "completed_at": "2024-01-15T11:30:00Z",
  "stock_updated": true
}
```

---

## GET /api/deliveries/:id/print
Get printable delivery document.

### Response 200
Returns PDF/HTML document.
