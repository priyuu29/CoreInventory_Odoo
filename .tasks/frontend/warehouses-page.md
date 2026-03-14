# Warehouse Page - Once UI Implementation

## Route
`/warehouses`

## File Structure
```
src/app/(dashboard)/warehouses/
├── page.tsx
├── WarehouseCard.tsx
└── NewWarehouseModal.tsx
```

## page.tsx
```tsx
"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Column,
  Row,
  Grid,
  Card,
  Text,
  Button,
  Dialog,
  Input,
  Badge,
} from "@once-ui-system/core";
import { warehousesApi, queryKeys } from '@/lib/api';
import { Warehouse } from '@/types';

export default function WarehousesPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const warehouses = data?.data || [];

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Warehouses</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setModalOpen(true)}>
          New Warehouse
        </Button>
      </Row>

      {/* Warehouse Grid */}
      {isLoading ? (
        <Card padding="32" horizontal="center">
          <Text variant="body-default-m">Loading warehouses...</Text>
        </Card>
      ) : warehouses.length === 0 ? (
        <Card padding="32" horizontal="center">
          <Column gap="12" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">No warehouses found</Text>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Create First Warehouse
            </Button>
          </Column>
        </Card>
      ) : (
        <Grid columns="3" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
          {warehouses.map((warehouse) => (
            <WarehouseCard 
              key={warehouse.id} 
              warehouse={warehouse}
              onView={() => router.push(`/warehouses/${warehouse.id}`)}
            />
          ))}
        </Grid>
      )}

      {/* New Warehouse Modal */}
      <NewWarehouseModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
      />
    </Column>
  );
}

// Warehouse Card Component
interface WarehouseCardProps {
  warehouse: Warehouse;
  onView: () => void;
}

function WarehouseCard({ warehouse, onView }: WarehouseCardProps) {
  return (
    <Card 
      padding="20" 
      radius="l" 
      direction="column" 
      gap="16"
      hover={{ scale: '2' }}
    >
      <Row vertical="center" horizontal="space-between">
        <Column gap="4">
          <Text variant="heading-default-m">{warehouse.name}</Text>
          <Badge variant="neutral" size="s">{warehouse.short_code}</Badge>
        </Column>
      </Row>

      <Text variant="body-default-s" onBackground="neutral-weak">
        {warehouse.address || 'No address'}
      </Text>

      <Row vertical="center" horizontal="space-between">
        <Text variant="label-default-s" onBackground="neutral-weak">
          Locations
        </Text>
        <Text variant="body-default-m" fontWeight="m">
          {warehouse.locations_count || 0}
        </Text>
      </Row>

      <Row gap="8">
        <Button variant="secondary" size="s" fillWidth onClick={onView}>
          View
        </Button>
        <Button variant="tertiary" size="s">
          Edit
        </Button>
        <Button variant="tertiary" size="s" onBackground="danger-strong">
          Delete
        </Button>
      </Row>
    </Card>
  );
}
```

## NewWarehouseModal.tsx
```tsx
"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  Button,
  Input,
  Column,
  Row,
  Text,
} from "@once-ui-system/core";
import { warehousesApi, queryKeys } from '@/lib/api';
import { WarehouseFormData } from '@/types';

interface NewWarehouseModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewWarehouseModal({ open, onClose }: NewWarehouseModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    short_code: '',
    address: '',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: () => warehousesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.list });
      onClose();
      setFormData({ name: '', short_code: '', address: '' });
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate();
  };

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title="Create New Warehouse"
      description="Add a new warehouse location"
      footer={
        <Row gap="8" horizontal="flex-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={!formData.name || !formData.short_code}
          >
            Create
          </Button>
        </Row>
      }
    >
      <Column gap="16" fillWidth>
        {error && (
          <Card padding="12" radius="m" background="danger-alpha-weak">
            <Text variant="body-default-s" onBackground="danger-strong">{error}</Text>
          </Card>
        )}
        
        <Input
          id="name"
          label="Warehouse Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Main Warehouse"
          required
        />
        
        <Input
          id="short_code"
          label="Short Code"
          value={formData.short_code}
          onChange={(e) => setFormData({ ...formData, short_code: e.target.value.toUpperCase() })}
          placeholder="WH"
          maxLength={10}
          required
        />
        
        <Input
          id="address"
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="123 Main Street, City"
        />
      </Column>
    </Dialog>
  );
}
```

## Once UI Components Used
| Component | Purpose |
|-----------|---------|
| `Column` | Vertical layout |
| `Row` | Horizontal layout |
| `Grid` | Responsive grid (3 cols desktop, 2 tablet, 1 mobile) |
| `Card` | Content containers with hover effects |
| `Text` | Typography |
| `Button` | Actions |
| `Input` | Form inputs |
| `Badge` | Short code display |
| `Dialog` | Modal for creating |

## React Query Integration
```tsx
// List warehouses
const { data, isLoading } = useQuery({
  queryKey: queryKeys.warehouses.list,
  queryFn: () => warehousesApi.list(),
});

// Create warehouse
const createMutation = useMutation({
  mutationFn: () => warehousesApi.create(formData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.list });
  },
});
```

## API Integration
- GET `/api/warehouses` - List all warehouses
- POST `/api/warehouses` - Create warehouse
- PUT `/api/warehouses/:id` - Update warehouse
- DELETE `/api/warehouses/:id` - Delete warehouse

## Features
1. ✅ Responsive grid (3/2/1 columns)
2. ✅ Card layout with hover effects
3. ✅ Badge for short code
4. ✅ Modal dialog for creation
5. ✅ Form validation
6. ✅ Loading and empty states
7. ✅ Error handling
