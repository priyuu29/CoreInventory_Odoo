# Dashboard Page

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

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                                               │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Receipts    │  │ Deliveries   │  │ Low Stock   │   │
│  │ 4 pending   │  │ 4 pending    │  │ 3 items     │   │
│  │ 1 late      │  │ 2 waiting    │  │             │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ Recent Receipts    │  │ Recent Deliveries   │      │
│  │ WH/IN/0001 - Ready │  │ WH/OUT/0001 - Wait   │      │
│  │ WH/IN/0002 - Draft │  │ WH/OUT/0002 - Done   │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Quick Actions                                   │   │
│  │ [+ New Receipt] [+ New Delivery] [+ New Product]│   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Components

### StatsCards.tsx
```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  data: {
    receipts_pending: number;
    receipts_late: number;
    deliveries_pending: number;
    deliveries_waiting: number;
  };
}

export function StatsCards({ data }: StatsCardsProps) {
  const cards = [
    {
      title: 'Receipts to Receive',
      value: data.receipts_pending,
      subtext: `${data.receipts_late} late`,
      color: data.receipts_late > 0 ? 'text-red-500' : 'text-blue-600',
      href: '/receipts',
    },
    {
      title: 'Deliveries to Send',
      value: data.deliveries_pending,
      subtext: `${data.deliveries_waiting} waiting`,
      color: 'text-orange-500',
      href: '/deliveries',
    },
    {
      title: 'Operations Today',
      value: data.receipts_pending + data.deliveries_pending,
      subtext: 'Total',
      color: 'text-green-600',
      href: '/moves',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### RecentReceipts.tsx
```tsx
export function RecentReceipts({ receipts }: { receipts: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Receipts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{receipt.reference}</p>
                <p className="text-sm text-slate-500">{receipt.vendor}</p>
              </div>
              <StatusBadge status={receipt.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## page.tsx
```tsx
import { StatsCards } from './components/StatsCards';
import { RecentReceipts } from './components/RecentReceipts';
import { RecentDeliveries } from './components/RecentDeliveries';
import { QuickActions } from './components/QuickActions';

async function getDashboardStats() {
  const res = await fetch(`${process.env.API_URL}/dashboard/stats`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <StatsCards data={data} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentReceipts receipts={data.recent_receipts || []} />
        <RecentDeliveries deliveries={data.recent_deliveries || []} />
      </div>
      
      <QuickActions />
    </div>
  );
}
```

## API Integration
- GET `/api/dashboard/stats`
