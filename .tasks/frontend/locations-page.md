# Locations Page - Once UI Implementation

## Route
`/locations`

## File Structure
```
src/app/(dashboard)/locations/
├── page.tsx
└── NewLocationModal.tsx
```

## page.tsx
```tsx
"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Column,
  Row,
  Card,
  Text,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Dialog,
} from "@once-ui-system/core";
import { locationsApi, warehousesApi, queryKeys } from '@/lib/api';
import { Location } from '@/types';

export default function LocationsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [warehouseId, setWarehouseId] = useState('all');

  const { data: locationsData, isLoading } = useQuery({
    queryKey: queryKeys.locations.list(warehouseId !== 'all' ? warehouseId : undefined),
    queryFn: () => locationsApi.list(warehouseId !== 'all' ? warehouseId : undefined),
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const locations = locationsData?.data || [];
  const warehouses = warehousesData?.data || [];

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Locations</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setModalOpen(true)}>
          New Location
        </Button>
      </Row>

      {/* Filters */}
      <Row gap="12" vertical="center">
        <Select
          id="warehouse"
          label="Filter by Warehouse"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          options={[
            { value: 'all', label: 'All Warehouses' },
            ...warehouses.map((w) => ({ value: w.id, label: w.name })),
          ]}
          style={{ width: '240px' }}
        />
      </Row>

      {/* Locations Table */}
      {isLoading ? (
        <Card padding="32" horizontal="center">
          <Text variant="body-default-m">Loading locations...</Text>
        </Card>
      ) : locations.length === 0 ? (
        <Card padding="32" horizontal="center">
          <Column gap="12" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">No locations found</Text>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Create First Location
            </Button>
          </Column>
        </Card>
      ) : (
        <Card padding="0" radius="l" overflow="hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Short Code</Th>
                <Th>Warehouse</Th>
                <Th>Description</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {locations.map((location) => (
                <Tr key={location.id} hover={{ background: 'neutral-alpha-weak' }}>
                  <Td>
                    <Text variant="body-default-m" fontWeight="m">
                      {location.name}
                    </Text>
                  </Td>
                  <Td>
                    <Badge variant="neutral" size="s">
                      {location.short_code}
                    </Badge>
                  </Td>
                  <Td>
                    <Text variant="body-default-s">
                      {location.warehouse?.name || '-'}
                    </Text>
                  </Td>
                  <Td>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {location.description || '-'}
                    </Text>
                  </Td>
                  <Td>
                    <Row gap="4">
                      <Button variant="tertiary" size="s">Edit</Button>
                      <Button variant="tertiary" size="s" onBackground="danger-strong">Delete</Button>
                    </Row>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* New Location Modal */}
      <NewLocationModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        warehouses={warehouses}
      />
    </Column>
  );
}
```

## NewLocationModal.tsx
```tsx
"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  Button,
  Input,
  Select,
  Column,
  Row,
  Text,
} from "@once-ui-system/core";
import { locationsApi, queryKeys } from '@/lib/api';
import { Warehouse } from '@/types';

interface NewLocationModalProps {
  open: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
}

export function NewLocationModal({ open, onClose, warehouses }: NewLocationModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    short_code: '',
    warehouse_id: '',
    description: '',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: () => locationsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.list() });
      onClose();
      setFormData({ name: '', short_code: '', warehouse_id: '', description: '' });
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
      title="Create New Location"
      description="Add a new location within a warehouse"
      footer={
        <Row gap="8" horizontal="flex-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={!formData.name || !formData.short_code || !formData.warehouse_id}
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
          label="Location Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Room A"
          required
        />
        
        <Input
          id="short_code"
          label="Short Code"
          value={formData.short_code}
          onChange={(e) => setFormData({ ...formData, short_code: e.target.value.toUpperCase() })}
          placeholder="RA"
          maxLength={10}
          required
        />
        
        <Select
          id="warehouse"
          label="Warehouse"
          value={formData.warehouse_id}
          onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
          options={[
            { value: '', label: 'Select warehouse' },
            ...warehouses.map((w) => ({ value: w.id, label: w.name })),
          ]}
          required
        />
        
        <Input
          id="description"
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description"
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
| `Card` | Content container |
| `Text` | Typography |
| `Button` | Actions |
| `Input` | Form inputs |
| `Select` | Dropdown |
| `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` | Data table |
| `Badge` | Short code display |
| `Dialog` | Modal |

## React Query Integration
```tsx
// List locations
const { data, isLoading } = useQuery({
  queryKey: queryKeys.locations.list(warehouseId),
  queryFn: () => locationsApi.list(warehouseId),
});

// Create location
const createMutation = useMutation({
  mutationFn: () => locationsApi.create(formData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.locations.list() });
  },
});
```

## API Integration
- GET `/api/locations` - List with warehouse filter
- POST `/api/locations` - Create location
- PUT `/api/locations/:id` - Update location
- DELETE `/api/locations/:id` - Delete location

## Features
1. ✅ Filter by warehouse
2. ✅ Table with all location data
3. ✅ Badge for short code
4. ✅ Modal for creating
5. ✅ Form validation
6. ✅ Loading and empty states
