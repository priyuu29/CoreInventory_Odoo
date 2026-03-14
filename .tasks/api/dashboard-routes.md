# Dashboard API Routes

## GET /api/dashboard/stats
Get warehouse activity summary.

### Headers
```
Authorization: Bearer <token>
```

### Response 200
```json
{
  "receipts_pending": 4,
  "receipts_late": 1,
  "deliveries_pending": 4,
  "deliveries_waiting": 2,
  "recent_receipts": [
    {
      "id": "uuid",
      "reference": "WH/IN/0001",
      "vendor": "Vendor Name",
      "status": "ready",
      "schedule_date": "2024-01-15"
    }
  ],
  "recent_deliveries": [
    {
      "id": "uuid",
      "reference": "WH/OUT/0001",
      "destination": "Customer Name",
      "status": "waiting",
      "schedule_date": "2024-01-15"
    }
  ]
}
```

---

## GET /api/dashboard/operations
Get recent operations summary.

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Number of records (default: 10) |

### Response 200
```json
{
  "operations": [
    {
      "id": "uuid",
      "type": "receipt",
      "reference": "WH/IN/0001",
      "status": "done",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```
