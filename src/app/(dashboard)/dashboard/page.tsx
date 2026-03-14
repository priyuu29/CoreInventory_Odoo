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
      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <Column fillWidth gap="32">
          <Text variant="heading-default-xl">Dashboard</Text>
          <SkeletonPage variant="dashboard" />
        </Column>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <Column fillWidth padding="32" horizontal="center">
          <Card padding="24" background="danger-alpha-weak" border="danger-medium">
            <Text variant="body-default-m" onBackground="danger-strong">
              Failed to load dashboard data
            </Text>
          </Card>
        </Column>
      </div>
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
    <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
      <Column fillWidth gap="32">
        <Text variant="heading-default-xl">Dashboard</Text>

        <Grid columns={3} gap="24" m={{ columns: 1 }} s={{ columns: 1 }}>
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

        <Grid columns={2} gap="24" m={{ columns: 1 }}>
          <RecentReceipts receipts={stats.recent_receipts || []} />
          <RecentDeliveries deliveries={stats.recent_deliveries || []} />
        </Grid>

        <QuickActions />
      </Column>
    </div>
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
    <Card
      padding="24"
      radius="l"
      direction="column"
      gap="8"
      background="surface"
      fillWidth
      className="stats-card"
    >
      <Text
        variant="label-default-m"
        onBackground="neutral-weak"
        style={{ fontSize: "14px", marginBottom: "4px" }}
      >
        {title}
      </Text>
      <Text
        variant="display-default-m"
        onBackground={`${color}-strong` as any}
        style={{ fontSize: "36px", fontWeight: 600, lineHeight: 1.2 }}
      >
        {value}
      </Text>
      <Text variant="label-default-xs" onBackground="neutral-weak" style={{ fontSize: "12px" }}>
        {subtext}
      </Text>

      <style jsx>{`
        .stats-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stats-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadow, rgba(0, 0, 0, 0.15));
        }
      `}</style>
    </Card>
  );
}

function RecentReceipts({ receipts }: { receipts: Receipt[] }) {
  return (
    <Card padding="24" radius="l" direction="column" gap="16" background="surface" fillWidth>
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-s">Recent Receipts</Text>
        <Button variant="tertiary" size="s" href="/receipts" style={{ marginTop: "-2px" }}>
          View All
        </Button>
      </Row>
      <Column gap="8">
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
              paddingY="8"
              borderBottom="neutral-alpha-weak"
            >
              <Column gap="4">
                <Text variant="body-default-m" style={{ fontWeight: 500 }}>
                  {receipt.reference}
                </Text>
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
        <Button variant="tertiary" size="s" href="/deliveries" style={{ marginTop: "-2px" }}>
          View All
        </Button>
      </Row>
      <Column gap="8">
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
              paddingY="8"
              borderBottom="neutral-alpha-weak"
            >
              <Column gap="4">
                <Text variant="body-default-m" style={{ fontWeight: 500 }}>
                  {delivery.reference}
                </Text>
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
  const config: Record<string, { label: string; bgClass: string }> = {
    draft: { label: "Draft", bgClass: "chip-draft" },
    waiting: { label: "Waiting", bgClass: "chip-waiting" },
    ready: { label: "Ready", bgClass: "chip-ready" },
    done: { label: "Done", bgClass: "chip-done" },
    late: { label: "Late", bgClass: "chip-late" },
  };

  const { label, bgClass } = config[status] || { label: status, bgClass: "chip-draft" };

  return (
    <>
      <div className={`status-chip ${bgClass}`}>{label}</div>
      <style jsx>{`
        .status-chip {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .chip-draft {
          background: var(--neutral-alpha-weak, #e5e5e5);
          color: var(--neutral-on-background, #374151);
        }
        .chip-waiting {
          background: var(--warning-alpha-weak, #fef3c7);
          color: var(--warning-on-background, #92400e);
        }
        .chip-ready {
          background: var(--success-alpha-weak, #d1fae5);
          color: var(--success-on-background, #065f46);
        }
        .chip-done {
          background: var(--brand-alpha-weak, #dbeafe);
          color: var(--brand-on-background, #1e40af);
        }
        .chip-late {
          background: var(--danger-alpha-weak, #fee2e2);
          color: var(--danger-on-background, #991b1b);
        }
      `}</style>
    </>
  );
}

function QuickActions() {
  return (
    <Card padding="24" radius="l" direction="column" gap="16" background="surface" fillWidth>
      <Text variant="heading-default-s">Quick Actions</Text>
      <Row gap="12" wrap>
        <Button
          variant="primary"
          href="/receipts"
          size="l"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          + New Receipt
        </Button>
        <Button
          variant="secondary"
          href="/deliveries"
          size="l"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          + New Delivery
        </Button>
        <Button
          variant="tertiary"
          href="/stocks"
          size="l"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          View Stock
        </Button>
      </Row>
    </Card>
  );
}
