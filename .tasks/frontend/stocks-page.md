# Stock Page

## Route
`/stocks`

## File Structure
```
src/app/(dashboard)/stocks/
├── page.tsx
└── StockTable.tsx
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Stock                                                    │
├─────────────────────────────────────────────────────────┤
│ [Search...] [All Warehouses v] [Low Stock Only]        │
├─────────────────────────────────────────────────────────┤
│ Product     │ Unit Cost │ On Hand │ Free to Use │Total │
├─────────────┼───────────┼─────────┼──────────────┼──────┤
│ Desk        │ 3000 Rs   │ 50      │ 45           │135000│
│ Table       │ 3000 Rs   │ 50      │ 50           │150000│
│ Chair       │ 1500 Rs   │ 20      │ 18           │27000 │
└─────────────────────────────────────────────────────────┘
```

## page.tsx
```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StockTable } from './StockTable';

export default function StocksPage() {
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['stocks', search, warehouseId, lowStockOnly],
    queryFn: () => 
      fetch(`/api/stocks?search=${search}&warehouse_id=${warehouseId}&low_stock=${lowStockOnly}`)
        .then(res => res.json()),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Stock" />

      <div className="flex items-center gap-4">
        <SearchBar placeholder="Search products..." onChange={setSearch} />
        <select
          className="border rounded-md px-3 py-2"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
        >
          <option value="all">All Warehouses</option>
          {/* Map warehouses from data */}
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Low Stock Only
        </label>
      </div>

      <StockTable stocks={data?.data || []} isLoading={isLoading} />
    </div>
  );
}
```

### StockTable.tsx
```tsx
'use client';

export function StockTable({ stocks, isLoading }: { stocks: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left p-3 font-medium">Product</th>
            <th className="text-left p-3 font-medium">SKU</th>
            <th className="text-right p-3 font-medium">Unit Cost</th>
            <th className="text-right p-3 font-medium">On Hand</th>
            <th className="text-right p-3 font-medium">Reserved</th>
            <th className="text-right p-3 font-medium">Free to Use</th>
            <th className="text-right p-3 font-medium">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id} className="border-b hover:bg-slate-50">
              <td className="p-3">{stock.product.name}</td>
              <td className="p-3 text-slate-500">{stock.product.sku}</td>
              <td className="p-3 text-right">${stock.product.unit_cost}</td>
              <td className="p-3 text-right font-medium">{stock.on_hand}</td>
              <td className="p-3 text-right text-orange-500">{stock.reserved}</td>
              <td className="p-3 text-right text-green-600">{stock.free_to_use}</td>
              <td className="p-3 text-right">
                ${stock.on_hand * stock.product.unit_cost}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## API Integration
- GET `/api/stocks`
