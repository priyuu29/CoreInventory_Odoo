"use client";

import { SkeletonTable } from "@/components/Skeleton";
import { movesApi, queryKeys, warehousesApi } from "@/lib/api";
import type { MoveFilters, StockMove } from "@/types";
import { Button, Card, Column, Flex, Icon, Row, Text } from "@once-ui-system/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const typeColors: Record<string, { bg: string; text: string }> = {
  receipt: { bg: "var(--success-alpha-weak)", text: "var(--success-strong)" },
  delivery: { bg: "var(--brand-alpha-weak)", text: "var(--brand-strong)" },
  adjustment: { bg: "var(--warning-alpha-weak)", text: "var(--warning-strong)" },
};

export default function MovesPage() {
  const [filters, setFilters] = useState<MoveFilters>({
    move_type: "all",
    warehouse_id: "all",
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
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <Column fillWidth gap="24">
        {/* Header */}
        <Row vertical="center" horizontal="between">
          <Text variant="heading-default-xl">Move History</Text>
        </Row>

        {/* Filters */}
        <Flex gap="16" wrap vertical="center" className="filters">
          <div className="filter-dropdown">
            <select
              className="dropdown-select"
              value={filters.move_type || "all"}
              onChange={(e) => updateFilter("move_type", e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="receipt">Receipt</option>
              <option value="delivery">Delivery</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <select
              className="dropdown-select"
              value={filters.warehouse_id || "all"}
              onChange={(e) => updateFilter("warehouse_id", e.target.value)}
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="date-filters">
            <input
              type="date"
              className="date-input"
              value={filters.date_from || ""}
              onChange={(e) => updateFilter("date_from", e.target.value)}
              placeholder="From"
            />
            <input
              type="date"
              className="date-input"
              value={filters.date_to || ""}
              onChange={(e) => updateFilter("date_to", e.target.value)}
              placeholder="To"
            />
          </div>
        </Flex>

        {/* Content */}
        {isLoading ? (
          <SkeletonTable rows={8} columns={6} />
        ) : moves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="arrowRight" size="xl" onBackground="neutral-weak" />
            </div>
            <Text variant="heading-default-s" style={{ marginBottom: "8px" }}>
              No movement history yet
            </Text>
            <Text
              variant="body-default-m"
              onBackground="neutral-weak"
              style={{ marginBottom: "24px" }}
            >
              Inventory movements will appear here when receipts, deliveries, or adjustments occur.
            </Text>
          </div>
        ) : (
          <MovesTable moves={moves} />
        )}
      </Column>

      <style jsx>{`
        .filters {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 24px;
        }
        .filter-dropdown {
          position: relative;
        }
        .dropdown-select {
          appearance: none;
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 8px;
          padding: 8px 32px 8px 12px;
          font-size: 14px;
          color: var(--neutral-on-background);
          cursor: pointer;
          min-width: 140px;
          height: 36px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: border-color 0.2s ease;
        }
        .dropdown-select:hover {
          border-color: var(--neutral-alpha-strong);
        }
        .dropdown-select:focus {
          outline: none;
          border-color: var(--brand);
        }
        .date-filters {
          display: flex;
          gap: 8px;
        }
        .date-input {
          appearance: none;
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: var(--neutral-on-background);
          cursor: pointer;
          height: 36px;
          min-width: 130px;
        }
        .date-input:hover {
          border-color: var(--neutral-alpha-strong);
        }
        .date-input:focus {
          outline: none;
          border-color: var(--brand);
        }
        .empty-state {
          max-width: 420px;
          margin: 60px auto;
          padding: 40px;
          border-radius: 12px;
          border: 1px dashed var(--neutral-alpha-medium);
          text-align: center;
          background: var(--surface);
        }
        .empty-icon {
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            align-items: flex-start;
          }
          .date-filters {
            width: 100%;
          }
          .date-input {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}

interface MovesTableProps {
  moves: StockMove[];
}

function MovesTable({ moves }: MovesTableProps) {
  return (
    <div className="table-container">
      <Row padding="16" className="table-header">
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          Date
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1.5 }}>
          Product
        </Text>
        <Text variant="label-default-xs" style={{ width: "80px", textAlign: "right" }}>
          Qty
        </Text>
        <Text variant="label-default-xs" style={{ width: "100px" }}>
          Type
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          From
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          To
        </Text>
      </Row>
      {moves.map((move) => (
        <Row key={move.id} padding="16" border="neutral-alpha-weak">
          <Text variant="body-default-m" style={{ flex: 1 }} onBackground="neutral-weak">
            {new Date(move.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Column gap="2" style={{ flex: 1.5 }}>
            <Text variant="body-default-m">{move.product.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {move.product.sku}
            </Text>
          </Column>
          <Text
            variant="body-default-m"
            style={{ width: "80px", textAlign: "right" }}
            onBackground={move.quantity > 0 ? "success-strong" : "danger-strong"}
          >
            {move.quantity > 0 ? "+" : ""}
            {move.quantity}
          </Text>
          <div style={{ width: "100px" }}>
            <span
              className="type-badge"
              style={{
                background: typeColors[move.move_type]?.bg || typeColors.adjustment.bg,
                color: typeColors[move.move_type]?.text || typeColors.adjustment.text,
              }}
            >
              {move.move_type}
            </span>
          </div>
          <Text variant="body-default-m" style={{ flex: 1 }} onBackground="neutral-weak">
            {move.from_warehouse?.name || move.from_location?.name || "-"}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }} onBackground="neutral-weak">
            {move.to_warehouse?.name || move.to_location?.name || "-"}
          </Text>
        </Row>
      ))}

      <style jsx>{`
        .table-container {
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 12px;
          overflow: hidden;
        }
        .table-header {
          background: var(--neutral-alpha-weak);
          border-bottom: 1px solid var(--neutral-alpha-medium);
        }
        .table-header :global(.react-typography) {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--neutral-on-background-weak);
        }
        .table-row {
          border-bottom: 1px solid var(--neutral-alpha-weak);
          transition: background 0.15s ease;
          cursor: pointer;
          min-height: 52px;
        }
        .table-row:hover {
          background: var(--neutral-alpha-weak);
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .type-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}
