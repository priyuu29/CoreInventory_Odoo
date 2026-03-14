# Stock Page - Once UI Implementation

## Route
`/stocks`

## File Structure
```
src/app/(dashboard)/stocks/
├── page.tsx
└── StockTable.tsx
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
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
} from "@once-ui-system/core";
import { stocksApi, warehousesApi, queryKeys } from '@/lib/api';
import { Stock, StockFilters } from '@/types';

export default function StocksPage() {
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const filters: StockFilters = {
    search: search || undefined,
    warehouse_id: warehouseId !== 'all' ? warehouseId : undefined,
    low_stock: lowStockOnly,
  };

  const { data: stocksData, isLoading } = useQuery({
    queryKey: queryKeys.stocks.list(filters),
    queryFn: () => stocksApi.list(filters),
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const stocks = stocksData?.data || [];
  const warehouses = warehousesData?.data || [];

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Stock</Text>
        <Button variant="secondary" prefixIcon="refresh">
          Refresh
        </Button>
      </Row>

      {/* Filters */}
      <Row gap="12" vertical="center" wrap>
        <Input
          id="search"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ width: '240px' }}
        />
        <Select
          id="warehouse"
          label="Warehouse"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          options={[
            { value: 'all', label: 'All Warehouses' },
            ...warehouses.map((w) => ({ value: w.id, label: w.name })),
          ]}
        />
        <Row gap="8" vertical="center">
          <input
            type="checkbox"
            id="lowStock"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          <Text variant="body-default-s">Low Stock Only</Text>
        </Row>
      </Row>

      {/* Stock Table */}
      <StockTable stocks={stocks} isLoading={isLoading} />
    </Column>
  );
}

// Stock Table Component
interface StockTableProps {
  stocks: Stock[];
  isLoading: boolean;
}

function StockTable({ stocks, isLoading }: StockTableProps) {
  if (isLoading) {
    return (
      <Card padding="32" horizontal="center">
        <Text variant="body-default-m">Loading stock...</Text>
      </Card>
    );
  }

  if (stocks.length === 0) {
    return (
      <Card padding="32" horizontal="center">
        <Text variant="body-default-m" onBackground="neutral-weak">No stock items found</Text>
      </Card>
    );
  }

  return (
    <Card padding="0" radius="l" overflow="hidden">
      <Table>
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th>SKU</Th>
            <Th textAlign="right">Unit Cost</Th>
            <Th textAlign="right">On Hand</Th>
            <Th textAlign="right">Reserved</Th>
            <Th textAlign="right">Free to Use</Th>
            <Th textAlign="right">Total Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {stocks.map((stock) => (
            <Tr key={stock.id} hover={{ background: 'neutral-alpha-weak' }}>
              <Td>
                <Column gap="2">
                  <Text variant="body-default-m" fontWeight="m">
                    {stock.product.name}
                  </Text>
                  {stock.warehouse && (
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {stock.warehouse.name}
                    </Text>
                  )}
                </Column>
              </Td>
              <Td>
                <Text variant="body-default-s" fontWeight="m" onBackground="neutral-weak">
                  {stock.product.sku}
                </Text>
              </Td>
              <Td textAlign="right">
                <Text variant="body-default-m">
                  ${stock.product.unit_cost.toLocaleString()}
                </Text>
              </Td>
              <Td textAlign="right">
                <Text variant="body-default-m" fontWeight="m">
                  {stock.on_hand}
                </Text>
              </Td>
              <Td textAlign="right">
                {stock.reserved > 0 ? (
                  <Badge variant="warning" size="s">
                    {stock.reserved}
                  </Badge>
                ) : (
                  <Text variant="body-default-s">0</Text>
                )}
              </Td>
              <Td textAlign="right">
                <Text variant="body-default-m" fontWeight="m" onBackground="success-strong">
                  {stock.free_to_use}
                </Text>
              </Td>
              <Td textAlign="right">
                <Text variant="body-default-m" fontWeight="m">
                  ${(stock.on_hand * stock.product.unit_cost).toLocaleString()}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
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
| `Input` | Search input |
| `Select` | Dropdown |
| `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` | Data table |
| `Badge` | Reserved quantity indicator |

## React Query Integration
```tsx
const { data, isLoading } = useQuery({
  queryKey: queryKeys.stocks.list(filters),
  queryFn: () => stocksApi.list(filters),
});
```

## API Integration
- GET `/api/stocks` - List with filters
- Parameters: search, warehouse_id, low_stock

## Features
1. ✅ Search by product name
2. ✅ Filter by warehouse
3. ✅ Low stock filter checkbox
4. ✅ Responsive table with all stock data
5. ✅ Reserved quantity badge
6. ✅ Total value calculation
7. ✅ Loading and empty states
