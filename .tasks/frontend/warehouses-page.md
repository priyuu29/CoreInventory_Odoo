# Warehouse Page

## Route
`/warehouses`

## File Structure
```
src/app/(dashboard)/warehouses/
├── page.tsx
├── WarehouseCard.tsx
└── NewWarehouseModal.tsx
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Warehouses                             [+ New Warehouse]│
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐                 │
│ │ Main Warehouse  │ │ Store Front     │                 │
│ │ WH              │ │ SF              │                 │
│ │ 123 Main St     │ │ 456 Oak Ave     │                 │
│ │ Locations: 5    │ │ Locations: 3    │                 │
│ │ [Edit] [Delete] │ │ [Edit] [Delete] │                 │
│ └─────────────────┘ └─────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

## page.tsx
```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { WarehouseCard } from './WarehouseCard';
import { NewWarehouseModal } from './NewWarehouseModal';

export default function WarehousesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => fetch('/api/warehouses').then(res => res.json()),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Warehouses"
        actions={<Button onClick={() => setModalOpen(true)}>+ New Warehouse</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.data?.map((warehouse: any) => (
          <WarehouseCard key={warehouse.id} warehouse={warehouse} />
        ))}
      </div>

      <NewWarehouseModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
```

### WarehouseCard.tsx
```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function WarehouseCard({ warehouse }: { warehouse: any }) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
        <span className="text-sm font-mono text-slate-500">{warehouse.short_code}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">{warehouse.address}</p>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Locations:</span>
          <span className="font-medium">{warehouse.locations_count || 0}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/warehouses/${warehouse.id}`)}
          >
            View
          </Button>
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## NewWarehouseModal.tsx
```tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function NewWarehouseModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', short_code: '', address: '' });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      fetch('/api/warehouses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      onOpenChange(false);
      setFormData({ name: '', short_code: '', address: '' });
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New Warehouse">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Main Warehouse"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Short Code</Label>
          <Input
            value={formData.short_code}
            onChange={(e) => setFormData({ ...formData, short_code: e.target.value.toUpperCase() })}
            placeholder="WH"
            maxLength={10}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

## API Integration
- GET `/api/warehouses`
- POST `/api/warehouses`
- PUT `/api/warehouses/:id`
- DELETE `/api/warehouses/:id`
