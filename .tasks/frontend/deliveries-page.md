# Deliveries List Page

## Route
`/deliveries`

## File Structure
```
src/app/(dashboard)/deliveries/
├── page.tsx
├── DeliveriesTable.tsx
├── DeliveriesKanban.tsx
└── NewDeliveryModal.tsx
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Deliveries                           [+ New Delivery]  │
├─────────────────────────────────────────────────────────┤
│ [Search...] [All Status v] [All Warehouse v] [List|Kanban]│
├─────────────────────────────────────────────────────────┤
│ Reference   │ To       │ From     │ Contact │ Date   │ Status│
├─────────────┼──────────┼──────────┼─────────┼────────┼───────┤
│ WH/OUT/0001 │ Customer │ WH/Stock │ Azure   │ Jan 10 │ Wait  │
│ WH/OUT/0002 │ Customer │ WH/Stock │ John    │ Jan 11 │ Done  │
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
import { DeliveriesTable } from './DeliveriesTable';
import { DeliveriesKanban } from './DeliveriesKanban';
import { NewDeliveryModal } from './NewDeliveryModal';

export default function DeliveriesPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', search, status],
    queryFn: () => fetch(`/api/deliveries?search=${search}&status=${status}`).then(res => res.json()),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Deliveries"
        actions={<Button onClick={() => setModalOpen(true)}>+ New Delivery</Button>}
      />

      <div className="flex items-center gap-4">
        <SearchBar placeholder="Search deliveries..." onChange={setSearch} />
        <select
          className="border rounded-md px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="waiting">Waiting</option>
          <option value="ready">Ready</option>
          <option value="done">Done</option>
        </select>
        <div className="flex gap-1 ml-auto">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button
            variant={view === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('kanban')}
          >
            Kanban
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <DeliveriesTable deliveries={data?.data || []} isLoading={isLoading} />
      ) : (
        <DeliveriesKanban deliveries={data?.data || []} />
      )}

      <NewDeliveryModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
```

### DeliveriesTable.tsx
```tsx
import { Link } from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';

export function DeliveriesTable({ deliveries, isLoading }: { deliveries: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left p-3 font-medium">Reference</th>
            <th className="text-left p-3 font-medium">To</th>
            <th className="text-left p-3 font-medium">From</th>
            <th className="text-left p-3 font-medium">Contact</th>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery) => (
            <tr key={delivery.id} className="border-b hover:bg-slate-50">
              <td className="p-3">
                <Link href={`/deliveries/${delivery.id}`} className="text-blue-600 hover:underline">
                  {delivery.reference}
                </Link>
              </td>
              <td className="p-3">{delivery.destination}</td>
              <td className="p-3">{delivery.warehouse}</td>
              <td className="p-3">{delivery.contact}</td>
              <td className="p-3">{delivery.schedule_date}</td>
              <td className="p-3">
                <StatusBadge status={delivery.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### DeliveriesKanban.tsx
```tsx
import { KanbanBoard } from '@/components/shared/KanbanBoard';
import { Link } from 'next/link';

const columns = ['draft', 'waiting', 'ready', 'done'];

export function DeliveriesKanban({ deliveries }: { deliveries: any[] }) {
  const grouped = columns.reduce((acc, status) => {
    acc[status] = deliveries.filter((d) => d.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <KanbanBoard columns={columns}>
      {columns.map((status) => (
        <div key={status} className="space-y-2">
          <h3 className="font-medium capitalize text-sm text-slate-500">
            {status} ({grouped[status]?.length || 0})
          </h3>
          {grouped[status]?.map((delivery) => (
            <Link
              key={delivery.id}
              href={`/deliveries/${delivery.id}`}
              className="block p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="font-medium">{delivery.reference}</p>
              <p className="text-sm text-slate-500">{delivery.destination}</p>
            </Link>
          ))}
        </div>
      ))}
    </KanbanBoard>
  );
}
```

## Status Flow
```
draft → waiting → ready → done
```

## API Integration
- GET `/api/deliveries`
- POST `/api/deliveries`
