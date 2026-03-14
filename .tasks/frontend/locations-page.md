# Locations Page

## Route
`/locations`

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Locations                                [+ New Location]│
├─────────────────────────────────────────────────────────┤
│ [All Warehouses v]                                       │
├─────────────────────────────────────────────────────────┤
│ Name        │ Short Code │ Warehouse    │ Actions        │
├─────────────┼────────────┼──────────────┼───────────────┤
│ Room A      │ RA         │ Main WH      │ [Edit] [Delete]│
│ Shelf B     │ SB         │ Main WH      │ [Edit] [Delete]│
│ Zone C      │ ZC         │ Store Front  │ [Edit] [Delete]│
└─────────────────────────────────────────────────────────┘
```

## page.tsx
```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { NewLocationModal } from './NewLocationModal';

export default function LocationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['locations', warehouseId],
    queryFn: () => fetch(`/api/locations?warehouse_id=${warehouseId}`).then(res => res.json()),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Locations"
        actions={<Button onClick={() => setModalOpen(true)}>+ New Location</Button>}
      />

      <div className="flex items-center gap-4">
        <select
          className="border rounded-md px-3 py-2"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        >
          <option value="all">All Warehouses</option>
          {/* Map warehouses */}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Short Code</th>
              <th className="text-left p-3 font-medium">Warehouse</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((location: any) => (
              <tr key={location.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{location.name}</td>
                <td className="p-3 font-mono text-slate-500">{location.short_code}</td>
                <td className="p-3">{location.warehouse.name}</td>
                <td className="p-3">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewLocationModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
```

### Hierarchy Visualization
```
Warehouse
├── Room A
│   ├── Shelf A1
│   └── Shelf A2
├── Room B
│   └── Shelf B1
└── Zone C
```

## API Integration
- GET `/api/locations`
- POST `/api/locations`
- PUT `/api/locations/:id`
- DELETE `/api/locations/:id`
