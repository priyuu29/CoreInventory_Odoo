# Receipts List Page

## Route
`/receipts`

## File Structure
```
src/app/(dashboard)/receipts/
├── page.tsx
├── ReceiptsTable.tsx
├── ReceiptsKanban.tsx
└── NewReceiptModal.tsx
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Receipts                              [+ New Receipt]   │
├─────────────────────────────────────────────────────────┤
│ [Search...] [All Status v] [All Warehouse v] [List|Kanban]│
├─────────────────────────────────────────────────────────┤
│ Reference   │ From     │ To      │ Contact │ Date   │ Status│
├─────────────┼──────────┼─────────┼─────────┼────────┼───────┤
│ WH/IN/0001  │ Vendor A │ WH/Stock│ Azure   │ Jan 10 │ Ready │
│ WH/IN/0002  │ Vendor B │ WH/Stock│ John    │ Jan 11 │ Draft │
└─────────────────────────────────────────────────────────┘
```

## Components

### page.tsx
```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ReceiptsTable } from './ReceiptsTable';
import { ReceiptsKanban } from './ReceiptsKanban';
import { NewReceiptModal } from './NewReceiptModal';

export default function ReceiptsPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['receipts', search, status],
    queryFn: () => fetch(`/api/receipts?search=${search}&status=${status}`).then(res => res.json()),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Receipts"
        actions={<Button onClick={() => setModalOpen(true)}>+ New Receipt</Button>}
      />

      <div className="flex items-center gap-4">
        <SearchBar placeholder="Search receipts..." onChange={setSearch} />
        <select
          className="border rounded-md px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
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
        <ReceiptsTable receipts={data?.data || []} isLoading={isLoading} />
      ) : (
        <ReceiptsKanban receipts={data?.data || []} />
      )}

      <NewReceiptModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
```

### ReceiptsTable.tsx
```tsx
import { Link } from 'next/link';
import { StatusBadge } from '@/components/shared/StatusBadge';

export function ReceiptsTable({ receipts, isLoading }: { receipts: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left p-3 font-medium">Reference</th>
            <th className="text-left p-3 font-medium">From</th>
            <th className="text-left p-3 font-medium">To</th>
            <th className="text-left p-3 font-medium">Contact</th>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id} className="border-b hover:bg-slate-50">
              <td className="p-3">
                <Link href={`/receipts/${receipt.id}`} className="text-blue-600 hover:underline">
                  {receipt.reference}
                </Link>
              </td>
              <td className="p-3">{receipt.vendor}</td>
              <td className="p-3">{receipt.warehouse}</td>
              <td className="p-3">{receipt.contact}</td>
              <td className="p-3">{receipt.schedule_date}</td>
              <td className="p-3">
                <StatusBadge status={receipt.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### ReceiptsKanban.tsx
```tsx
import { KanbanBoard } from '@/components/shared/KanbanBoard';
import { Link } from 'next/link';

const columns = ['draft', 'ready', 'done'];

export function ReceiptsKanban({ receipts }: { receipts: any[] }) {
  const grouped = columns.reduce((acc, status) => {
    acc[status] = receipts.filter((r) => r.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <KanbanBoard columns={columns}>
      {columns.map((status) => (
        <div key={status} className="space-y-2">
          <h3 className="font-medium capitalize text-sm text-slate-500">
            {status} ({grouped[status]?.length || 0})
          </h3>
          {grouped[status]?.map((receipt) => (
            <Link
              key={receipt.id}
              href={`/receipts/${receipt.id}`}
              className="block p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="font-medium">{receipt.reference}</p>
              <p className="text-sm text-slate-500">{receipt.vendor}</p>
            </Link>
          ))}
        </div>
      ))}
    </KanbanBoard>
  );
}
```

## API Integration
- GET `/api/receipts`
- POST `/api/receipts`
