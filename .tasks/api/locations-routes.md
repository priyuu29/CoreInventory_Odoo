# Location API Routes

## GET /api/locations
List all locations.

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| warehouse_id | uuid | Filter by warehouse |

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Room A",
      "short_code": "RA",
      "warehouse": {
        "id": "uuid",
        "name": "Main Warehouse"
      },
      "description": "Ground floor storage",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## POST /api/locations
Create a new location.

### Request
```json
{
  "name": "Room A",
  "short_code": "RA",
  "warehouse_id": "uuid",
  "description": "Ground floor storage"
}
```

### Response 201
```json
{
  "id": "uuid",
  "name": "Room A",
  "short_code": "RA",
  "warehouse_id": "uuid",
  "description": "Ground floor storage",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## GET /api/locations/:id
Get location details.

### Response 200
```json
{
  "id": "uuid",
  "name": "Room A",
  "short_code": "RA",
  "warehouse": {
    "id": "uuid",
    "name": "Main Warehouse"
  },
  "description": "Ground floor storage",
  "stocks": [
    {
      "product": {
        "id": "uuid",
        "name": "Desk"
      },
      "on_hand": 20
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## PUT /api/locations/:id
Update location.

---

## DELETE /api/locations/:id
Delete location (only if no stocks exist).

---

## GET /api/locations/warehouse/:warehouseId
Get all locations for a specific warehouse (for dropdowns).

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Room A",
      "short_code": "RA"
    },
    {
      "id": "uuid",
      "name": "Shelf B",
      "short_code": "SB"
    }
  ]
}
```
