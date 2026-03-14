"use client";

import { SkeletonFilters, SkeletonTable } from "@/components/Skeleton";
import { queryKeys, stocksApi, warehousesApi } from "@/lib/api";
import type { Stock, StockFilters } from "@/types";
import { Button, Card, Column, Flex, Icon, Input, Row, Text } from "@once-ui-system/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function StocksPage() {
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const filters: StockFilters = {
    search: search || undefined,
    warehouse_id: warehouseId !== "all" ? warehouseId : undefined,
    low_stock: lowStockOnly,
  };

  const {
    data: stocksData,
    isLoading,
    refetch,
  } = useQuery({
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
    <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <Column fillWidth gap="24">
        {/* Header */}
        <Row vertical="center" horizontal="between">
          <Text variant="heading-default-xl">Stock</Text>
          <Button
            variant="secondary"
            prefixIcon="refresh"
            onClick={() => refetch()}
            className="refresh-btn"
          >
            Refresh
          </Button>
        </Row>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-wrapper">
            <Icon name="search" size="s" onBackground="neutral-weak" />
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <select
              className="dropdown-select"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <select
              className="dropdown-select"
              value={lowStockOnly ? "low" : "all"}
              onChange={(e) => setLowStockOnly(e.target.value === "low")}
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        <StockTable stocks={stocks} isLoading={isLoading} />
      </Column>

      <style jsx>{`
        .filters-section {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 8px;
          padding: 0 12px;
          height: 36px;
          min-width: 240px;
        }
        .search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: var(--neutral-on-background);
          width: 100%;
        }
        .search-input::placeholder {
          color: var(--neutral-weak);
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
          min-width: 160px;
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
        .refresh-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--neutral-alpha-medium);
          background: var(--surface);
          transition: all 0.2s ease;
        }
        .refresh-btn:hover {
          background: var(--neutral-alpha-weak);
        }
        .refresh-btn :global(.react-icon) {
          transition: transform 0.3s ease;
        }
        .refresh-btn:hover :global(.react-icon) {
          transform: rotate(180deg);
        }
        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          .search-wrapper {
            width: 100%;
          }
          .dropdown-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

interface StockTableProps {
  stocks: Stock[];
  isLoading: boolean;
}

function StockTable({ stocks, isLoading }: StockTableProps) {
  if (isLoading) {
    return <SkeletonTable rows={8} columns={6} />;
  }

  if (stocks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Icon name="package" size="xl" onBackground="neutral-weak" />
        </div>
        <Text variant="heading-default-s" style={{ marginBottom: "8px" }}>
          No stock items yet
        </Text>
        <Text variant="body-default-m" onBackground="neutral-weak" style={{ marginBottom: "24px" }}>
          Products will appear here when inventory is received.
        </Text>
        <Button variant="primary" href="/receipts">
          Go to Receipts
        </Button>

        <style jsx>{`
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
        `}</style>
      </div>
    );
  }

  return (
    <div className="stock-table-container">
      <Row padding="16" className="table-header">
        <Text variant="label-default-xs" style={{ flex: 2 }}>
          Product
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          SKU
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1, textAlign: "right" }}>
          Unit Cost
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1, textAlign: "right" }}>
          On Hand
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1, textAlign: "right" }}>
          Reserved
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1, textAlign: "right" }}>
          Free to Use
        </Text>
      </Row>
      {stocks.map((stock) => (
        <Row key={stock.id} padding="16" className="table-row">
          <Column gap="2" style={{ flex: 2 }}>
            <Text variant="body-default-m">{stock.product.name}</Text>
            {stock.warehouse && (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {stock.warehouse.name}
              </Text>
            )}
          </Column>
          <Text variant="body-default-s" style={{ flex: 1 }} onBackground="neutral-weak">
            {stock.product.sku}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1, textAlign: "right" }}>
            ${stock.product.unit_cost.toLocaleString()}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1, textAlign: "right" }}>
            {stock.on_hand}
          </Text>
          <Text
            variant="body-default-m"
            style={{ flex: 1, textAlign: "right" }}
            onBackground="warning-strong"
          >
            {stock.reserved}
          </Text>
          <Text
            variant="body-default-m"
            style={{ flex: 1, textAlign: "right" }}
            onBackground="success-strong"
          >
            {stock.free_to_use}
          </Text>
        </Row>
      ))}

      <style jsx>{`
        .stock-table-container {
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
        }
        .table-row:hover {
          background: var(--neutral-alpha-weak);
        }
        .table-row:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
