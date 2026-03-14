"use client";

import { Card, Column, Row } from "@once-ui-system/core";

const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = "100%",
  height = "16px",
  radius = "4px",
  style,
}: SkeletonProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <div
        style={{
          width,
          height,
          borderRadius: radius,
          backgroundColor: "var(--neutral-alpha-weak, #e5e5e5)",
          background:
            "linear-gradient(90deg, var(--neutral-alpha-weak, #e5e5e5) 25%, var(--surface, #f5f5f5) 50%, var(--neutral-alpha-weak, #e5e5e5) 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          ...style,
        }}
      />
    </>
  );
}

interface SkeletonTableRowProps {
  columns: number;
}

function SkeletonTableRow({ columns }: SkeletonTableRowProps) {
  return (
    <div
      style={{
        display: "flex",
        padding: "16px",
        borderBottom: "1px solid var(--neutral-alpha-medium, #e5e5e5)",
        alignItems: "center",
        gap: "16px",
      }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height="16px" style={{ flex: 1 }} />
      ))}
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function SkeletonTable({ rows = 5, columns = 5, showHeader = true }: SkeletonTableProps) {
  return (
    <Card padding="0" radius="l" overflow="hidden" fillWidth direction="column">
      {showHeader && (
        <div
          style={{
            display: "flex",
            padding: "16px",
            background: "var(--neutral-alpha-weak, #f5f5f5)",
            borderBottom: "1px solid var(--neutral-alpha-medium, #e5e5e5)",
            gap: "16px",
            width: "100%",
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="14px" style={{ flex: 1 }} />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </Card>
  );
}

export function SkeletonStatsCard() {
  return (
    <Card padding="24" radius="l" direction="column" gap="12" fillWidth>
      <Skeleton height="14px" width="60%" />
      <Skeleton height="32px" width="40%" />
      <Skeleton height="12px" width="30%" />
    </Card>
  );
}

export function SkeletonWarehouseCard() {
  return (
    <Card padding="20" radius="l" direction="column" gap="16" fillWidth>
      <Row vertical="center" horizontal="between">
        <Column gap="4">
          <Skeleton height="20px" width="120px" />
          <Skeleton height="12px" width="60px" />
        </Column>
      </Row>

      <Skeleton height="14px" width="80%" />

      <Row vertical="center" horizontal="between">
        <Skeleton height="12px" width="60px" />
        <Skeleton height="16px" width="40px" />
      </Row>

      <Row gap="8">
        <Skeleton height="32px" radius="6px" style={{ flex: 1 }} />
        <Skeleton height="32px" radius="6px" width="60px" />
        <Skeleton height="32px" radius="6px" width="60px" />
      </Row>
    </Card>
  );
}

function SkeletonListItem() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--neutral-alpha-medium, #e5e5e5)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Skeleton height="16px" width="100px" />
        <Skeleton height="12px" width="60px" />
      </div>
      <Skeleton height="24px" width="60px" radius="12px" />
    </div>
  );
}

interface SkeletonKanbanColumnProps {
  items?: number;
}

function SkeletonKanbanColumn({ items = 3 }: SkeletonKanbanColumnProps) {
  return (
    <Column gap="12" fillWidth>
      <Card padding="12" radius="m" background="neutral-alpha-weak" fillWidth>
        <Row vertical="center" horizontal="between">
          <Skeleton height="14px" width="50px" />
          <Skeleton height="14px" width="20px" />
        </Row>
      </Card>
      <Column gap="8">
        {Array.from({ length: items }).map((_, i) => (
          <Card key={i} padding="16" radius="m" direction="column" gap="4" fillWidth>
            <Skeleton height="16px" width="80%" />
            <Skeleton height="12px" width="50%" />
          </Card>
        ))}
      </Column>
    </Column>
  );
}

export function SkeletonFilters() {
  return (
    <Card padding="16" radius="l" fillWidth>
      <Row gap="12" wrap vertical="center">
        <Skeleton height="40px" width="200px" radius="4px" />
        <Skeleton height="40px" width="150px" radius="4px" />
        <Skeleton height="40px" width="100px" radius="4px" />
      </Row>
    </Card>
  );
}

export function SkeletonPage({
  variant = "table",
}: { variant?: "table" | "cards" | "kanban" | "dashboard" }) {
  switch (variant) {
    case "table":
      return <SkeletonTable rows={8} columns={5} />;
    case "cards":
      return (
        <Row gap="16" wrap fillWidth>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ flex: "1 1 280px", maxWidth: "350px", width: "100%" }}>
              <SkeletonWarehouseCard />
            </div>
          ))}
        </Row>
      );
    case "kanban":
      return (
        <Row gap="16" fillWidth>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flex: 1, minWidth: "200px" }}>
              <SkeletonKanbanColumn items={3} />
            </div>
          ))}
        </Row>
      );
    case "dashboard":
      return (
        <Column gap="24" fillWidth>
          <Row gap="16" fillWidth>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ flex: 1 }}>
                <SkeletonStatsCard />
              </div>
            ))}
          </Row>
          <Row gap="16" fillWidth>
            <div style={{ flex: 1 }}>
              <Card padding="24" radius="l" direction="column" gap="16" fillWidth>
                <Row vertical="center" horizontal="between">
                  <Skeleton height="18px" width="100px" />
                  <Skeleton height="32px" width="60px" radius="6px" />
                </Row>
                <Column gap="12">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonListItem key={i} />
                  ))}
                </Column>
              </Card>
            </div>
            <div style={{ flex: 1 }}>
              <Card padding="24" radius="l" direction="column" gap="16" fillWidth>
                <Row vertical="center" horizontal="between">
                  <Skeleton height="18px" width="100px" />
                  <Skeleton height="32px" width="60px" radius="6px" />
                </Row>
                <Column gap="12">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonListItem key={i} />
                  ))}
                </Column>
              </Card>
            </div>
          </Row>
          <Card padding="24" radius="l" direction="column" gap="16" fillWidth>
            <Skeleton height="18px" width="100px" />
            <Row gap="12">
              <Skeleton height="40px" width="120px" radius="6px" />
              <Skeleton height="40px" width="120px" radius="6px" />
              <Skeleton height="40px" width="100px" radius="6px" />
            </Row>
          </Card>
        </Column>
      );
    default:
      return <SkeletonTable rows={5} columns={5} />;
  }
}
