# Receipt Details Page

## Route
`/receipts/[id]`

## File Structure
```
src/app/(dashboard)/receipts/[id]/
├── page.tsx
└── ReceiptItemsForm.tsx
```

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back   Receipt # WH/IN/0001                          │
│          [Validate] [Print] [Cancel]                   │
├─────────────────────────────────────────────────────────┤
│ Status: Ready                                          │
├────────────────────┬────────────────────────────────────┤
│ Receive From       │ Schedule Date: Jan 15, 2024       │
│ Vendor: Vendor A   │ Responsible: John Doe             │
│ Contact: +123456   │                                    │
├────────────────────┴────────────────────────────────────┤
│ Products                                               │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Product      │ Quantity │ Unit Cost │ Actions    │  │
│ ├──────────────┼──────────┼───────────┼────────────┤  │
│ │ Desk         │ 10       │ 3000      │ [Edit][X]  │  │
│ │ Chair        │ 20       │ 1500      │ [Edit][X]  │  │
│ └──────────────────────────────────────────────────┘  │
│ [+ Add Product]                                        │
└─────────────────────────────────────────────────────────┘
```

## page.tsx
```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceiptItemsForm } from './ReceiptItemsForm';
import { useState } from 'react';

export default function ReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addingProduct, setAddingProduct] = useState(false);

  const { data: receipt, isLoading } = useQuery({
    queryKey: ['receipt', params.id],
    queryFn: () => fetch(`/api/receipts/${params.id}`).then(res => res.json()),
  });

  const validateMutation = useMutation({
    mutationFn: () => fetch(`/api/receipts/${params.id}/validate`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['receipt', params.id] }),
  });

  const completeMutation = useMutation({
    mutationFn: () => fetch(`/api/receipts/${params.id}/complete`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['receipt', params.id] }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
          <h1 className="text-2xl font-bold">Receipt #{receipt.reference}</h1>
          <StatusBadge status={receipt.status} />
        </div>
        <div className="flex gap-2">
          {receipt.status === 'draft' && (
            <Button onClick={() => validateMutation.mutate()}>Validate</Button>
          )}
          {receipt.status === 'ready' && (
            <Button onClick={() => completeMutation.mutate()}>Complete</Button>
          )}
          <Button variant="outline">Print</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receive From</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Vendor:</span> {receipt.vendor}</p>
            <p><span className="font-medium">Contact:</span> {receipt.contact}</p>
            <p><span className="font-medium">Responsible:</span> {receipt.responsible}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Warehouse:</span> {receipt.warehouse?.name}</p>
            <p><span className="font-medium">Location:</span> {receipt.location?.name}</p>
            <p><span className="font-medium">Schedule Date:</span> {receipt.schedule_date}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products</CardTitle>
          {receipt.status === 'draft' && (
            <Button size="sm" onClick={() => setAddingProduct(true)}>+ Add Product</Button>
          )}
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Unit Cost</th>
                <th className="text-left p-2">Total</th>
                {receipt.status === 'draft' && <th className="text-left p-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {receipt.items?.map((item: any) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.product.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">${item.unit_cost}</td>
                  <td className="p-2">${item.quantity * item.unit_cost}</td>
                  {receipt.status === 'draft' && (
                    <td className="p-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {addingProduct && (
        <ReceiptItemsForm
          receiptId={receipt.id}
          onClose={() => setAddingProduct(false)}
        />
      )}
    </div>
  );
}
```

## Status Flow
```
draft → ready → done
```

## API Integration
- GET `/api/receipts/:id`
- POST `/api/receipts/:id/validate`
- POST `/api/receipts/:id/complete`
- POST `/api/receipts/:id/items`
