# Move History Page

## Route
`/moves`

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Move History                                             │
├─────────────────────────────────────────────────────────┤
│ [Search...] [Type v] [Date Range] [Warehouse v]         │
├─────────────────────────────────────────────────────────┤
│ Date      │ Product │ Qty  │ Type     │ From    │ To    │
├───────────┼─────────┼──────┼──────────┼─────────┼────────┤
│ Jan 15    │ Desk    │ +10  │ Receipt  │ Vendor  │ WH     │
│ Jan 15    │ Desk    │ -5   │ Delivery │ WH      │ Cust.  │
│ Jan 14    │ Chair   │ +20  │ Receipt  │ Vendor  │ WH     │
│ Jan 13    │ Table   │ -3   │ Delivery │ WH      │ Cust.  │
└─────────────────────────────────────────────────────────┘
```

## page.tsx
```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';

export default function MovesPage() {
  const [filters, setFilters] = useState({
    search: '',
    move_type: 'all',
    date_from: '',
    date_to: '',
    warehouse_id: 'all',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['moves', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.move_type !== 'all') params.append('move_type', filters.move_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.warehouse_id !== 'all') params.append('warehouse_id', filters.warehouse_id);
      return fetch(`/api/moves?${params}`).then(res => res.json());
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Move History" />

      <div className="flex items-center gap-4 flex-wrap">
        <SearchBar placeholder="Search product..." onChange={(v) => setFilters({...filters, search: v})} />
        
        <select
          className="border rounded-md px-3 py-2"
          value={filters.move_type}
          onChange={(e) => setFilters({...filters, move_type: e.target.value})}
        >
          <option value="all">All Types</option>
          <option value="receipt">Receipt</option>
          <option value="delivery">Delivery</option>
          <option value="adjustment">Adjustment</option>
        </select>

        <input
          type="date"
          className="border rounded-md px-3 py-2"
          value={filters.date_from}
          onChange={(e) => setFilters({...filters, date_from: e.target.value})}
          placeholder="From Date"
        />

        <input
          type="date"
          className="border rounded-md px-3 py-2"
          value={filters.date_to}
          onChange={(e) => setFilters({...filters, date_to: e.target.value})}
          placeholder="To Date"
        />

        <select
          className="border rounded-md px-3 py-2"
          value={filters.warehouse_id}
          onChange={(e) => setFilters({...filters, warehouse_id: e.target.value})}
        >
          <option value="all">All Warehouses</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-right p-3 font-medium">Qty</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">From</th>
              <th className="text-left p-3 font-medium">To</th>
              <th className="text-left p-3 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((move: any) => (
              <tr key={move.id} className="border-b hover:bg-slate-50">
                <td className="p-3 text-slate-500">
                  {new Date(move.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">{move.product.name}</td>
                <td className={`p-3 text-right font-medium ${move.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {move.quantity > 0 ? '+' : ''}{move.quantity}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    move.move_type === 'receipt' ? 'bg-green-100 text-green-700' :
                    move.move_type === 'delivery' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {move.move_type}
                  </span>
                </td>
                <td className="p-3 text-slate-500">
                  {move.from_warehouse?.name || '-'}
                </td>
                <td className="p-3 text-slate-500">
                  {move.to_warehouse?.name || '-'}
                </td>
                <td className="p-3">
                  <a href={`/${move.move_type}s/${move.operation_id}`} className="text-blue-600 hover:underline">
                    {move.reference}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## API Integration
- GET `/api/moves`
- GET `/api/moves/:id`
- GET `/api/moves/product/:productId`
