# Delivery Details Page

## Route
`/deliveries/[id]`

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back   Delivery # WH/OUT/0001                        │
│          [Validate] [Print] [Cancel]                   │
├─────────────────────────────────────────────────────────┤
│ Status: Waiting                                         │
├────────────────────┬────────────────────────────────────┤
│ Delivery Address   │ Schedule Date: Jan 15, 2024       │
│ Customer: Customer A│ Responsible: John Doe            │
│ Contact: +123456   │                                    │
├────────────────────┴────────────────────────────────────┤
│ Products                    [Check Stock]              │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Product      │ Quantity │ Available │ Status    │  │
│ ├──────────────┼──────────┼───────────┼───────────┤  │
│ │ Desk         │ 10       │ 15        │ OK        │  │
│ │ Chair        │ 5        │ 2         │ Low Stock │  │
│ └──────────────────────────────────────────────────┘   │
│ [+ Add Product]                                         │
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
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DeliveryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: delivery, isLoading } = useQuery({
    queryKey: ['delivery', params.id],
    queryFn: () => fetch(`/api/deliveries/${params.id}`).then(res => res.json()),
  });

  const validateMutation = useMutation({
    mutationFn: () => fetch(`/api/deliveries/${params.id}/validate`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery', params.id] }),
  });

  const completeMutation = useMutation({
    mutationFn: () => fetch(`/api/deliveries/${params.id}/complete`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery', params.id] }),
  });

  const checkStockMutation = useMutation({
    mutationFn: () => fetch(`/api/deliveries/${params.id}/check-stock`, { method: 'POST' }),
  });

  if (isLoading) return <div>Loading...</div>;

  const hasLowStock = delivery?.items?.some((item: any) => !item.is_available);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
          <h1 className="text-2xl font-bold">Delivery #{delivery.reference}</h1>
          <StatusBadge status={delivery.status} />
        </div>
        <div className="flex gap-2">
          {delivery.status === 'waiting' && (
            <>
              <Button variant="outline" onClick={() => checkStockMutation.mutate()}>
                Check Stock
              </Button>
              <Button onClick={() => validateMutation.mutate()}>Validate</Button>
            </>
          )}
          {delivery.status === 'ready' && (
            <Button onClick={() => completeMutation.mutate()}>Complete</Button>
          )}
          <Button variant="outline">Print</Button>
        </div>
      </div>

      {hasLowStock && (
        <Alert variant="destructive">
          <AlertDescription>
            Some items are not available in stock. Please adjust quantities before validating.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Customer:</span> {delivery.destination}</p>
            <p><span className="font-medium">Contact:</span> {delivery.contact}</p>
            <p><span className="font-medium">Responsible:</span> {delivery.responsible}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Warehouse:</span> {delivery.warehouse?.name}</p>
            <p><span className="font-medium">Location:</span> {delivery.location?.name}</p>
            <p><span className="font-medium">Schedule Date:</span> {delivery.schedule_date}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products</CardTitle>
          {delivery.status === 'draft' && (
            <Button size="sm">+ Add Product</Button>
          )}
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Quantity</th>
                <th className="text-left p-2">Available</th>
                <th className="text-left p-2">Status</th>
                {delivery.status === 'draft' && <th className="text-left p-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {delivery.items?.map((item: any) => (
                <tr 
                  key={item.id} 
                  className={`border-b ${!item.is_available ? 'bg-red-50' : ''}`}
                >
                  <td className="p-2">{item.product.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{item.available_stock}</td>
                  <td className="p-2">
                    {item.is_available ? (
                      <span className="text-green-600">OK</span>
                    ) : (
                      <span className="text-red-600">Low Stock</span>
                    )}
                  </td>
                  {delivery.status === 'draft' && (
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
    </div>
  );
}
```

## Special Rules
- If stock unavailable: row turns red, show alert, disable validation

## API Integration
- GET `/api/deliveries/:id`
- POST `/api/deliveries/:id/check-stock`
- POST `/api/deliveries/:id/validate`
- POST `/api/deliveries/:id/complete`
