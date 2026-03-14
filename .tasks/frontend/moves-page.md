# Move History Page - Once UI Implementation

## Route
`/moves`

## File Structure
```
src/app/(dashboard)/moves/
└── page.tsx
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
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from "@once-ui-system/core";
import { movesApi, warehousesApi, queryKeys } from '@/lib/api';
import { StockMove, MoveFilters, MoveType } from '@/types';

export default function MovesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<MoveFilters>({
    search: '',
    move_type: 'all',
    date_from: '',
    date_to: '',
    warehouse_id: 'all',
  });

  const { data: movesData, isLoading } = useQuery({
    queryKey: queryKeys.moves.list(filters),
    queryFn: () => movesApi.list(filters),
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const moves = movesData?.data || [];
  const warehouses = warehousesData?.data || [];

  const updateFilter = (key: keyof MoveFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Move History</Text>
      </Row>

      {/* Filters */}
      <Card padding="16" radius="l">
        <Row gap="12" wrap vertical="center">
          <Input
            id="search"
            label="Search"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search product..."
            style={{ width: '200px' }}
          />
          
          <Select
            id="move_type"
            label="Type"
            value={filters.move_type || 'all'}
            onChange={(e) => updateFilter('move_type', e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'receipt', label: 'Receipt' },
              { value: 'delivery', label: 'Delivery' },
              { value: 'adjustment', label: 'Adjustment' },
            ]}
            style={{ width: '160px' }}
          />

          <Input
            id="date_from"
            label="From Date"
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => updateFilter('date_from', e.target.value)}
            style={{ width: '160px' }}
          />

          <Input
            id="date_to"
            label="To Date"
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => updateFilter('date_to', e.target.value)}
            style={{ width: '160px' }}
          />

          <Select
            id="warehouse"
            label="Warehouse"
            value={filters.warehouse_id || 'all'}
            onChange={(e) => updateFilter('warehouse_id', e.target.value)}
            options={[
              { value: 'all', label: 'All Warehouses' },
              ...warehouses.map((w) => ({ value: w.id, label: w.name })),
            ]}
            style={{ width: '180px' }}
          />
        </Row>
      </Card>

      {/* Moves Table */}
      {isLoading ? (
        <Card padding="32" horizontal="center">
          <Text variant="body-default-m">Loading moves...</Text>
        </Card>
      ) : moves.length === 0 ? (
        <Card padding="32" horizontal="center">
          <Text variant="body-default-m" onBackground="neutral-weak">No movements found</Text>
        </Card>
      ) : (
        <Card padding="0" radius="l" overflow="hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Product</Th>
                <Th textAlign="right">Qty</Th>
                <Th>Type</Th>
                <Th>From</Th>
                <Th>To</Th>
                <Th>Reference</Th>
              </Tr>
            </Thead>
            <Tbody>
              {moves.map((move) => (
                <Tr key={move.id} hover={{ background: 'neutral-alpha-weak' }}>
                  <Td>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {new Date(move.createdAt).toLocaleDateString()}
                    </Text>
                  </Td>
                  <Td>
                    <Column gap="2">
                      <Text variant="body-default-m" fontWeight="m">
                        {move.product.name}
                      </Text>
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        {move.product.sku}
                      </Text>
                    </Column>
                  </Td>
                  <Td textAlign="right">
                    <Text 
                      variant="body-default-m" 
                      fontWeight="m" 
                      onBackground={move.quantity > 0 ? 'success-strong' : 'danger-strong'}
                    >
                      {move.quantity > 0 ? '+' : ''}{move.quantity}
                    </Text>
                  </Td>
                  <Td>
                    <MoveTypeBadge type={move.move_type} />
                  </Td>
                  <Td>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {move.from_warehouse?.name || move.from_location?.name || '-'}
                    </Text>
                  </Td>
                  <Td>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {move.to_warehouse?.name || move.to_location?.name || '-'}
                    </Text>
                  </Td>
                  <Td>
                    {move.reference && (
                      <Text 
                        variant="body-default-s" 
                        onBackground="brand-strong"
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push(`/${move.move_type}s/${move.operation_id}`)}
                      >
                        {move.reference}
                      </Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}
    </Column>
  );
}

// Move Type Badge Component
function MoveTypeBadge({ type }: { type: MoveType }) {
  const config: Record<MoveType, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
    receipt: { label: 'Receipt', variant: 'success' },
    delivery: { label: 'Delivery', variant: 'warning' },
    adjustment: { label: 'Adjustment', variant: 'neutral' },
  };

  const { label, variant } = config[type] || { label: type, variant: 'neutral' as const };

  return (
    <Badge variant={variant} size="s">
      {label}
    </Badge>
  );
}
```

## Once UI Components Used
| Component | Purpose |
|-----------|---------|
| `Column` | Vertical layout |
| `Row` | Horizontal layout with wrap |
| `Card` | Filter container, content container |
| `Text` | Typography |
| `Input` | Search, date inputs |
| `Select` | Dropdowns |
| `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` | Data table |
| `Badge` | Move type indicator |

## React Query Integration
```tsx
const { data, isLoading } = useQuery({
  queryKey: queryKeys.moves.list(filters),
  queryFn: () => movesApi.list(filters),
});
```

## API Integration
- GET `/api/moves` - List with filters
- Parameters: search, move_type, date_from, date_to, warehouse_id

## Features
1. ✅ Multiple filters (search, type, date range, warehouse)
2. ✅ Color-coded quantity (green for positive, red for negative)
3. ✅ Move type badge
4. ✅ Product info with SKU
5. ✅ Reference links to operations
6. ✅ Loading and empty states
7. ✅ Responsive filter row with wrap
