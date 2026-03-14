# Receipts List Page - Once UI Implementation

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
import { receiptsApi, queryKeys } from '@/lib/api';
import { Receipt, ReceiptFilters } from '@/types';

export default function ReceiptsPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filters: ReceiptFilters = {
    search: search || undefined,
    status: status as ReceiptFilters['status'],
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.receipts.list(filters),
    queryFn: () => receiptsApi.list(filters),
  });

  const receipts = data?.data || [];

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Receipts</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setModalOpen(true)}>
          New Receipt
        </Button>
      </Row>

      {/* Filters */}
      <Row gap="12" vertical="center" wrap>
        <Input
          id="search"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipts..."
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
          <Text variant="body-default-m">Loading receipts...</Text>
        </Card>
      ) : view === 'list' ? (
        <ReceiptsTable 
          receipts={receipts} 
          onRowClick={(id) => router.push(`/receipts/${id}`)}
        />
      ) : (
        <ReceiptsKanban 
          receipts={receipts}
          onCardClick={(id) => router.push(`/receipts/${id}`)}
        />
      )}

      {/* New Receipt Modal */}
      {modalOpen && (
        <NewReceiptModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
        />
      )}
    </Column>
  );
}

// Receipts Table Component
interface ReceiptsTableProps {
  receipts: Receipt[];
  onRowClick: (id: string) => void;
}

function ReceiptsTable({ receipts, onRowClick }: ReceiptsTableProps) {
  if (receipts.length === 0) {
    return (
      <Card padding="32" horizontal="center">
        <Text variant="body-default-m" onBackground="neutral-weak">No receipts found</Text>
      </Card>
    );
  }

  return (
    <Card padding="0" radius="l" overflow="hidden">
      <Table>
        <Thead>
          <Tr>
            <Th>Reference</Th>
            <Th>From</Th>
            <Th>To</Th>
            <Th>Contact</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {receipts.map((receipt) => (
            <Tr 
              key={receipt.id} 
              onClick={() => onRowClick(receipt.id)}
              hover={{ background: 'neutral-alpha-weak' }}
              style={{ cursor: 'pointer' }}
            >
              <Td>
                <Text variant="body-default-m" fontWeight="m" onBackground="brand-strong">
                  {receipt.reference}
                </Text>
              </Td>
              <Td>{receipt.vendor || '-'}</Td>
              <Td>{receipt.warehouse?.name || '-'}</Td>
              <Td>{receipt.contact || '-'}</Td>
              <Td>{receipt.schedule_date ? new Date(receipt.schedule_date).toLocaleDateString() : '-'}</Td>
              <Td>
                <StatusBadge status={receipt.status} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
}

// Receipts Kanban Component
interface ReceiptsKanbanProps {
  receipts: Receipt[];
  onCardClick: (id: string) => void;
}

function ReceiptsKanban({ receipts, onCardClick }: ReceiptsKanbanProps) {
  const columns = ['draft', 'ready', 'done'];
  
  const grouped = columns.reduce((acc, status) => {
    acc[status] = receipts.filter((r) => r.status === status);
    return acc;
  }, {} as Record<string, Receipt[]>);

  return (
    <Grid columns="3" gap="16" m={{ columns: 1 }} s={{ columns: 1 }}>
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
            {grouped[status]?.map((receipt) => (
              <Card 
                key={receipt.id} 
                padding="16" 
                radius="m" 
                direction="column" 
                gap="4"
                hover={{ scale: '2' }}
                onClick={() => onCardClick(receipt.id)}
                style={{ cursor: 'pointer' }}
              >
                <Text variant="body-default-m" fontWeight="m">
                  {receipt.reference}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {receipt.vendor || 'No vendor'}
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
  const config: Record<string, { label: string; variant: 'neutral' | 'brand' | 'success' }> = {
    draft: { label: 'Draft', variant: 'neutral' },
    ready: { label: 'Ready', variant: 'brand' },
    done: { label: 'Done', variant: 'success' },
  };

  const { label, variant } = config[status] || { label: status, variant: 'neutral' };

  return <Badge variant={variant} size="s">{label}</Badge>;
}
```

## NewReceiptModal.tsx
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
import { receiptsApi, warehousesApi, queryKeys } from '@/lib/api';

interface NewReceiptModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewReceiptModal({ open, onClose }: NewReceiptModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vendor: '',
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
    mutationFn: () => receiptsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      onClose();
      setFormData({
        vendor: '',
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
      title="Create New Receipt"
      description="Fill in the details to create a new receipt"
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
            Create Receipt
          </Button>
        </Row>
      }
    >
      <Column gap="16" fillWidth>
        <Input
          id="vendor"
          label="Vendor"
          value={formData.vendor}
          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
          placeholder="Enter vendor name"
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
| `Grid` | Responsive grid |
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
// List receipts
const { data, isLoading } = useQuery({
  queryKey: queryKeys.receipts.list(filters),
  queryFn: () => receiptsApi.list(filters),
});

// Create receipt
const createMutation = useMutation({
  mutationFn: () => receiptsApi.create(formData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['receipts'] });
  },
});
```

## API Integration
- GET `/api/receipts` - List with filters
- POST `/api/receipts` - Create new receipt
- Filters: search, status, warehouse_id, date_from, date_to

## Features
1. ✅ List and Kanban view toggle
2. ✅ Search and status filters
3. ✅ Responsive grid (3 cols desktop, 1 col mobile)
4. ✅ Status badge component
5. ✅ Modal for creating new receipt
6. ✅ Loading states
7. ✅ Empty state handling
