"use client";

import { SkeletonPage } from "@/components/Skeleton";
import { dashboardApi, queryKeys } from "@/lib/api";
import type { Delivery, Receipt } from "@/types";
import { Button, Card, Column, Grid, Row, Text } from "@once-ui-system/core";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Column fillWidth gap="24">
        <Row vertical="center" horizontal="between">
          <Text variant="heading-default-xl">Dashboard</Text>
        </Row>
        <SkeletonPage variant="dashboard" />
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
    <Column fillWidth gap="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Dashboard</Text>
      </Row>

      <Grid columns={3} gap="16" m={{ columns: 1 }} s={{ columns: 1 }}>
        <StatsCard
          title="Receipts to Receive"
          value={stats.receipts_pending}
          subtext={`${stats.receipts_late} late`}
          color="brand"
        />
        <StatsCard
          title="Deliveries to Send"
          value={stats.deliveries_pending}
          subtext={`${stats.deliveries_waiting} waiting`}
          color="warning"
        />
        <StatsCard
          title="Operations Today"
          value={stats.receipts_pending + stats.deliveries_pending}
          subtext="Total"
          color="success"
        />
      </Grid>

      <Grid columns={2} gap="16" m={{ columns: 1 }}>
        <RecentReceipts receipts={stats.recent_receipts || []} />
        <RecentDeliveries deliveries={stats.recent_deliveries || []} />
      </Grid>

      <QuickActions />
    </Column>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  subtext: string;
  color: string;
}

function StatsCard({ title, value, subtext, color }: StatsCardProps) {
  return (
    <Card padding="24" radius="l" direction="column" gap="12" background="surface" fillWidth>
      <Text variant="label-default-m" onBackground="neutral-weak">
        {title}
      </Text>
      <Text variant="display-default-m" onBackground={`${color}-strong` as any}>
        {value}
      </Text>
      <Text variant="label-default-xs" onBackground="neutral-weak">
        {subtext}
      </Text>
    </Card>
  );
}

function RecentReceipts({ receipts }: { receipts: Receipt[] }) {
  return (
    <Card padding="24" radius="l" direction="column" gap="16" background="surface" fillWidth>
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-s">Recent Receipts</Text>
        <Button variant="tertiary" size="s" href="/receipts">
          View All
        </Button>
      </Row>
      <Column gap="12">
        {receipts.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">
            No recent receipts
          </Text>
        ) : (
          receipts.slice(0, 5).map((receipt) => (
            <Row
              key={receipt.id}
              vertical="center"
              horizontal="between"
              paddingY="12"
              border="neutral-alpha-weak"
            >
              <Column gap="2">
                <Text variant="body-default-m">{receipt.reference}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {receipt.vendor || "No vendor"}
                </Text>
              </Column>
              <StatusChip status={receipt.status} />
            </Row>
          ))
        )}
      </Column>
    </Card>
  );
}

function RecentDeliveries({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <Card padding="24" radius="l" direction="column" gap="16" background="surface" fillWidth>
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-s">Recent Deliveries</Text>
        <Button variant="tertiary" size="s" href="/deliveries">
          View All
        </Button>
      </Row>
      <Column gap="12">
        {deliveries.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">
            No recent deliveries
          </Text>
        ) : (
          deliveries.slice(0, 5).map((delivery) => (
            <Row
              key={delivery.id}
              vertical="center"
              horizontal="between"
              paddingY="12"
              border="neutral-alpha-weak"
            >
              <Column gap="2">
                <Text variant="body-default-m">{delivery.reference}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {delivery.destination || "No destination"}
                </Text>
              </Column>
              <StatusChip status={delivery.status} />
            </Row>
          ))
        )}
      </Column>
    </Card>
  );
}

function StatusChip({ status }: { status: string }) {
  const config: Record<string, { label: string }> = {
    draft: { label: "Draft" },
    waiting: { label: "Waiting" },
    ready: { label: "Ready" },
    done: { label: "Done" },
    late: { label: "Late" },
  };

  const { label } = config[status] || { label: status };

  return <Text variant="label-default-xs">{label}</Text>;
}

function QuickActions() {
  return (
    <Card padding="24" radius="l" direction="column" gap="16" background="surface" fillWidth>
      <Text variant="heading-default-s">Quick Actions</Text>
      <Row gap="12" wrap>
        <Button variant="primary" href="/receipts">
          New Receipt
        </Button>
        <Button variant="secondary" href="/deliveries">
          New Delivery
        </Button>
        <Button variant="tertiary" href="/stocks">
          View Stock
        </Button>
      </Row>
    </Card>
  );
}
