# Deliveries List Page - Once UI Implementation

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

## page.tsx
```tsx
"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Column,
  Row,
  Card,
  Text,
  Button,
  Input,
  Select,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
} from "@once-ui-system/core";
import { deliveriesApi, warehousesApi, queryKeys } from '@/lib/api';
import { Delivery, DeliveryFilters } from '@/types';

export default function DeliveriesPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filters: DeliveryFilters = {
    search: search || undefined,
    status: status as DeliveryFilters['status'],
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.deliveries.list(filters),
    queryFn: () => deliveriesApi.list(filters),
  });

  const deliveries = data?.data || [];

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Deliveries</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setModalOpen(true)}>
          New Delivery
        </Button>
      </Row>

      {/* Filters */}
      <Row gap="12" vertical="center" wrap>
        <Input
          id="search"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deliveries..."
          style={{ width: '240px' }}
        />
        <Select
          id="status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'draft', label: 'Draft' },
            { value: 'waiting', label: 'Waiting' },
            { value: 'ready', label: 'Ready' },
            { value: 'done', label: 'Done' },
          ]}
        />
        <Row gap="4" ml="auto">
          <Button
            variant={view === 'list' ? 'primary' : 'tertiary'}
            size="s"
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button
            variant={view === 'kanban' ? 'primary' : 'tertiary'}
            size="s"
            onClick={() => setView('kanban')}
          >
            Kanban
          </Button>
        </Row>
      </Row>

      {/* Content */}
      {isLoading ? (
        <Card padding="32" horizontal="center">
          <Text variant="body-default-m">Loading deliveries...</Text>
        </Card>
      ) : view === 'list' ? (
        <DeliveriesTable 
          deliveries={deliveries} 
          onRowClick={(id) => router.push(`/deliveries/${id}`)}
        />
      ) : (
        <DeliveriesKanban 
          deliveries={deliveries}
          onCardClick={(id) => router.push(`/deliveries/${id}`)}
        />
      )}

      {/* New Delivery Modal */}
      {modalOpen && (
        <NewDeliveryModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
        />
      )}
    </Column>
  );
}

// Deliveries Table Component
interface DeliveriesTableProps {
  deliveries: Delivery[];
  onRowClick: (id: string) => void;
}

function DeliveriesTable({ deliveries, onRowClick }: DeliveriesTableProps) {
  if (deliveries.length === 0) {
    return (
      <Card padding="32" horizontal="center">
        <Text variant="body-default-m" onBackground="neutral-weak">No deliveries found</Text>
      </Card>
    );
  }

  return (
    <Card padding="0" radius="l" overflow="hidden">
      <Table>
        <Thead>
          <Tr>
            <Th>Reference</Th>
            <Th>To</Th>
            <Th>From</Th>
            <Th>Contact</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {deliveries.map((delivery) => (
            <Tr 
              key={delivery.id} 
              onClick={() => onRowClick(delivery.id)}
              hover={{ background: 'neutral-alpha-weak' }}
              style={{ cursor: 'pointer' }}
            >
              <Td>
                <Text variant="body-default-m" fontWeight="m" onBackground="brand-strong">
                  {delivery.reference}
                </Text>
              </Td>
              <Td>{delivery.destination || '-'}</Td>
              <Td>{delivery.warehouse?.name || '-'}</Td>
              <Td>{delivery.contact || '-'}</Td>
              <Td>{delivery.schedule_date ? new Date(delivery.schedule_date).toLocaleDateString() : '-'}</Td>
              <Td>
                <StatusBadge status={delivery.status} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
}

// Deliveries Kanban Component
interface DeliveriesKanbanProps {
  deliveries: Delivery[];
  onCardClick: (id: string) => void;
}

function DeliveriesKanban({ deliveries, onCardClick }: DeliveriesKanbanProps) {
  const columns = ['draft', 'waiting', 'ready', 'done'];
  
  const grouped = columns.reduce((acc, status) => {
    acc[status] = deliveries.filter((d) => d.status === status);
    return acc;
  }, {} as Record<string, Delivery[]>);

  return (
    <Grid columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
      {columns.map((status) => (
        <Column key={status} gap="12">
          <Card padding="12" radius="m" background="neutral-alpha-weak">
            <Row vertical="center" horizontal="space-between">
              <Text variant="label-default-m" fontWeight="m" style={{ textTransform: 'capitalize' }}>
                {status}
              </Text>
              <Badge variant="neutral" size="s">
                {grouped[status]?.length || 0}
              </Badge>
            </Row>
          </Card>
          <Column gap="8">
            {grouped[status]?.map((delivery) => (
              <Card 
                key={delivery.id} 
                padding="16" 
                radius="m" 
                direction="column" 
                gap="4"
                hover={{ scale: '2' }}
                onClick={() => onCardClick(delivery.id)}
                style={{ cursor: 'pointer' }}
              >
                <Text variant="body-default-m" fontWeight="m">
                  {delivery.reference}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {delivery.destination || 'No destination'}
                </Text>
              </Card>
            ))}
          </Column>
        </Column>
      ))}
    </Grid>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'neutral' | 'brand' | 'success' | 'warning' }> = {
    draft: { label: 'Draft', variant: 'neutral' },
    waiting: { label: 'Waiting', variant: 'warning' },
    ready: { label: 'Ready', variant: 'brand' },
    done: { label: 'Done', variant: 'success' },
  };

  const { label, variant } = config[status] || { label: status, variant: 'neutral' };

  return <Badge variant={variant} size="s">{label}</Badge>;
}
```

## NewDeliveryModal.tsx
```tsx
"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  Button,
  Input,
  Select,
  Column,
  Row,
  Text,
} from "@once-ui-system/core";
import { deliveriesApi, warehousesApi, queryKeys } from '@/lib/api';

interface NewDeliveryModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewDeliveryModal({ open, onClose }: NewDeliveryModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    destination: '',
    warehouse_id: '',
    location_id: '',
    responsible: '',
    contact: '',
    schedule_date: '',
    notes: '',
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => deliveriesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      onClose();
      setFormData({
        destination: '',
        warehouse_id: '',
        location_id: '',
        responsible: '',
        contact: '',
        schedule_date: '',
        notes: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const warehouses = warehousesData?.data || [];

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title="Create New Delivery"
      description="Fill in the details to create a new delivery"
      footer={
        <Row gap="8" horizontal="flex-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={createMutation.isPending}
            disabled={!formData.warehouse_id}
          >
            Create Delivery
          </Button>
        </Row>
      }
    >
      <Column gap="16" fillWidth>
        <Input
          id="destination"
          label="Destination"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          placeholder="Enter destination"
        />
        
        <Select
          id="warehouse"
          label="Warehouse"
          value={formData.warehouse_id}
          onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
          options={[
            { value: '', label: 'Select warehouse' },
            ...warehouses.map((w: any) => ({ value: w.id, label: w.name })),
          ]}
        />
        
        <Input
          id="responsible"
          label="Responsible"
          value={formData.responsible}
          onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
          placeholder="Enter responsible person"
        />
        
        <Input
          id="contact"
          label="Contact"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          placeholder="Enter contact number"
        />
        
        <Input
          id="schedule_date"
          label="Schedule Date"
          type="date"
          value={formData.schedule_date}
          onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
        />
        
        <Input
          id="notes"
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes"
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
| `Grid` | Responsive grid (4 cols desktop, 2 tablet, 1 mobile) |
| `Card` | Content containers |
| `Text` | Typography |
| `Button` | Actions |
| `Input` | Form inputs |
| `Select` | Dropdowns |
| `Badge` | Status indicators |
| `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` | Data table |
| `Dialog` | Modal |

## React Query Integration
```tsx
// List deliveries
const { data, isLoading } = useQuery({
  queryKey: queryKeys.deliveries.list(filters),
  queryFn: () => deliveriesApi.list(filters),
});

// Create delivery
const createMutation = useMutation({
  mutationFn: () => deliveriesApi.create(formData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
  },
});
```

## API Integration
- GET `/api/deliveries` - List with filters
- POST `/api/deliveries` - Create new delivery
- Filters: search, status, warehouse_id, date_from, date_to

## Status Flow
```
draft → waiting → ready → done
```

## Features
1. ✅ List and Kanban view toggle (4 columns for delivery status)
2. ✅ Search and status filters
3. ✅ Responsive grid
4. ✅ Status badge component
5. ✅ Modal for creating new delivery
6. ✅ Loading states
7. ✅ Empty state handling
