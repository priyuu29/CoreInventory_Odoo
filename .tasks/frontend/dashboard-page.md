# Dashboard Page - Once UI Implementation

## Route
`/dashboard`

## File Structure
```
src/app/(dashboard)/dashboard/
├── page.tsx
└── components/
    ├── StatsCards.tsx
    ├── RecentReceipts.tsx
    ├── RecentDeliveries.tsx
    └── QuickActions.tsx
```

## page.tsx
```tsx
"use client";

import { useQuery } from '@tanstack/react-query';
import {
  Column,
  Row,
  Grid,
  Card,
  Text,
  Button,
  Badge,
} from "@once-ui-system/core";
import { dashboardApi, queryKeys } from '@/lib/api';
import { Receipt, Delivery } from '@/types';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Column fillWidth padding="24" horizontal="center" vertical="center" minHeight="400">
        <Text variant="body-default-m">Loading dashboard...</Text>
      </Column>
    );
  }

  if (error) {
    return (
      <Column fillWidth padding="24" horizontal="center">
        <Card padding="24" background="danger-alpha-weak" border="danger-medium">
          <Text variant="body-default-m" onBackground="danger-strong">
            Failed to load dashboard data
          </Text>
        </Card>
      </Column>
    );
  }

  const stats = data || {
    receipts_pending: 0,
    receipts_late: 0,
    deliveries_pending: 0,
    deliveries_waiting: 0,
    recent_receipts: [],
    recent_deliveries: [],
  };

  return (
    <Column fillWidth gap="24" padding="24">
      {/* Page Header */}
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-xl">Dashboard</Text>
      </Row>

      {/* Stats Cards */}
      <Grid columns="3" gap="16" m={{ columns: 1 }} s={{ columns: 1 }}>
        <StatsCard
          title="Receipts to Receive"
          value={stats.receipts_pending}
          subtext={`${stats.receipts_late} late`}
          variant={stats.receipts_late > 0 ? 'danger' : 'brand'}
          href="/receipts"
        />
        <StatsCard
          title="Deliveries to Send"
          value={stats.deliveries_pending}
          subtext={`${stats.deliveries_waiting} waiting`}
          variant="warning"
          href="/deliveries"
        />
        <StatsCard
          title="Operations Today"
          value={stats.receipts_pending + stats.deliveries_pending}
          subtext="Total"
          variant="success"
          href="/moves"
        />
      </Grid>

      {/* Recent Activity */}
      <Grid columns="2" gap="16" m={{ columns: 1 }}>
        <RecentReceipts receipts={stats.recent_receipts || []} />
        <RecentDeliveries deliveries={stats.recent_deliveries || []} />
      </Grid>

      {/* Quick Actions */}
      <QuickActions />
    </Column>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  subtext: string;
  variant: 'brand' | 'success' | 'warning' | 'danger';
  href: string;
}

function StatsCard({ title, value, subtext, variant, href }: StatsCardProps) {
  return (
    <Card 
      padding="20" 
      radius="l" 
      direction="column" 
      gap="8"
      hover={{ scale: '2' }}
      style={{ cursor: 'pointer' }}
    >
      <Text variant="label-default-m" onBackground="neutral-weak">
        {title}
      </Text>
      <Text 
        variant="heading-default-xl" 
        fontWeight="xl"
        onBackground={`${variant}-strong` as any}
      >
        {value}
      </Text>
      <Text variant="label-default-xs" onBackground="neutral-weak">
        {subtext}
      </Text>
    </Card>
  );
}

// Recent Receipts Component
function RecentReceipts({ receipts }: { receipts: Receipt[] }) {
  return (
    <Card padding="20" radius="l" direction="column" gap="16">
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-s">Recent Receipts</Text>
        <Button variant="tertiary" size="s" href="/receipts">View All</Button>
      </Row>
      <Column gap="12">
        {receipts.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">No recent receipts</Text>
        ) : (
          receipts.slice(0, 5).map((receipt) => (
            <Row 
              key={receipt.id} 
              vertical="center" 
              horizontal="space-between"
              paddingY="8"
              border="neutral-alpha-weak"
              style={{ cursor: 'pointer' }}
            >
              <Column gap="2">
                <Text variant="body-default-m" fontWeight="m">{receipt.reference}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {receipt.vendor || 'No vendor'}
                </Text>
              </Column>
              <StatusBadge status={receipt.status} />
            </Row>
          ))
        )}
      </Column>
    </Card>
  );
}

// Recent Deliveries Component
function RecentDeliveries({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <Card padding="20" radius="l" direction="column" gap="16">
      <Row vertical="center" horizontal="space-between">
        <Text variant="heading-default-s">Recent Deliveries</Text>
        <Button variant="tertiary" size="s" href="/deliveries">View All</Button>
      </Row>
      <Column gap="12">
        {deliveries.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">No recent deliveries</Text>
        ) : (
          deliveries.slice(0, 5).map((delivery) => (
            <Row 
              key={delivery.id} 
              vertical="center" 
              horizontal="space-between"
              paddingY="8"
              border="neutral-alpha-weak"
              style={{ cursor: 'pointer' }}
            >
              <Column gap="2">
                <Text variant="body-default-m" fontWeight="m">{delivery.reference}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {delivery.destination || 'No destination'}
                </Text>
              </Column>
              <StatusBadge status={delivery.status} />
            </Row>
          ))
        )}
      </Column>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' }> = {
    draft: { label: 'Draft', variant: 'neutral' },
    waiting: { label: 'Waiting', variant: 'warning' },
    ready: { label: 'Ready', variant: 'brand' },
    done: { label: 'Done', variant: 'success' },
    late: { label: 'Late', variant: 'danger' },
  };

  const { label, variant } = config[status] || { label: status, variant: 'neutral' as const };

  return (
    <Badge variant={variant} size="s">
      {label}
    </Badge>
  );
}

// Quick Actions Component
function QuickActions() {
  return (
    <Card padding="20" radius="l" direction="column" gap="16">
      <Text variant="heading-default-s">Quick Actions</Text>
      <Row gap="12" wrap>
        <Button variant="primary" prefixIcon="plus" href="/receipts/new">
          New Receipt
        </Button>
        <Button variant="secondary" prefixIcon="plus" href="/deliveries/new">
          New Delivery
        </Button>
        <Button variant="tertiary" prefixIcon="package" href="/stocks">
          View Stock
        </Button>
      </Row>
    </Card>
  );
}
```

## Components Breakdown

### StatsCards
- Uses Grid for responsive columns (3 on desktop, 1 on mobile/tablet)
- Once UI Card with hover effects
- Semantic props for styling (variant colors)

### RecentReceipts / RecentDeliveries
- Card containers with list of items
- StatusBadge component for status display
- Link to full list pages

### QuickActions
- Row with Button components
- prefixIcon for icons

## Once UI Components Used
| Component | Purpose |
|-----------|---------|
| `Column` | Vertical layout |
| `Row` | Horizontal layout |
| `Grid` | CSS Grid with responsive breakpoints |
| `Card` | Content container with variants |
| `Text` | Typography with variants |
| `Button` | Actions with variants, icons |
| `Badge` | Status indicators |

## React Query Integration
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.dashboard.stats,
  queryFn: () => dashboardApi.getStats(),
  refetchInterval: 30000, // Auto-refresh every 30s
});
```

## API Integration
- GET `/api/dashboard/stats`
- Returns: `{ receipts_pending, receipts_late, deliveries_pending, deliveries_waiting, recent_receipts[], recent_deliveries[] }`

## Responsive Breakpoints
- Desktop: 3 columns for stats
- Mobile/Tablet: 1 column
- Grid uses `m={{ columns: 1 }}` and `s={{ columns: 1 }}` for responsive
