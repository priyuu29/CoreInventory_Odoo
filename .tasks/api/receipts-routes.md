# Receipts API Routes

## GET /api/receipts
List all receipts with pagination and filters.

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
| search | string | Search in reference/vendor |
| date_from | date | Filter from date |
| date_to | date | Filter to date |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "reference": "WH/IN/0001",
      "vendor": "Vendor Name",
      "warehouse": "Warehouse 1",
      "contact": "John Doe",
      "schedule_date": "2024-01-15",
      "status": "ready",
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

## POST /api/receipts
Create a new receipt.

### Headers
```
Authorization: Bearer <token>
```

### Request
```json
{
  "vendor": "Vendor Name",
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
  "reference": "WH/IN/0001",
  "vendor": "Vendor Name",
  "warehouse_id": "uuid",
  "status": "draft",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## GET /api/receipts/:id
Get receipt details with items.

### Response 200
```json
{
  "id": "uuid",
  "reference": "WH/IN/0001",
  "vendor": "Vendor Name",
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
  "status": "ready",
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
      "unit_cost": 3000
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

## PUT /api/receipts/:id
Update receipt details.

### Request
```json
{
  "vendor": "Updated Vendor",
  "responsible": "Jane Doe",
  "contact": "+0987654321",
  "schedule_date": "2024-01-16",
  "notes": "Updated notes"
}
```

---

## DELETE /api/receipts/:id
Delete a receipt (only if draft).

### Response 200
```json
{
  "message": "Receipt deleted successfully"
}
```

---

## POST /api/receipts/:id/items
Add product to receipt.

### Request
```json
{
  "product_id": "uuid",
  "quantity": 10,
  "unit_cost": 3000,
  "notes": "Optional notes"
}
```

---

## PUT /api/receipts/:id/items/:itemId
Update receipt item.

---

## DELETE /api/receipts/:id/items/:itemId
Remove item from receipt.

---

## POST /api/receipts/:id/validate
Validate receipt (change status from draft to ready).

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

## POST /api/receipts/:id/complete
Complete receipt (change status from ready to done, update stock).

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

## GET /api/receipts/:id/print
Get printable receipt document.

### Response 200
Returns PDF/HTML document.
