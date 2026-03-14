"use client";

import { SkeletonFilters, SkeletonTable } from "@/components/Skeleton";
import { queryKeys, stocksApi, warehousesApi } from "@/lib/api";
import type { Stock, StockFilters } from "@/types";
import { Button, Card, Column, Flex, Input, Row, Select, Text } from "@once-ui-system/core";
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
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Stock</Text>
        <Button variant="secondary" prefixIcon="refresh">
          Refresh
        </Button>
      </Row>

      <Flex gap="12" wrap horizontal="between" vertical="center">
        <Flex
          gap="12"
          m={{ direction: "column" }}
          s={{ direction: "column" }}
          style={{ minWidth: "200px" }}
        >
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Search
            </Text>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </Column>
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Warehouse
            </Text>
            <Row gap="2">
              <Button
                variant={warehouseId === "all" ? "primary" : "tertiary"}
                size="s"
                onClick={() => setWarehouseId("all")}
              >
                All
              </Button>
              {warehouses.slice(0, 3).map((w) => (
                <Button
                  key={w.id}
                  variant={warehouseId === w.id ? "primary" : "tertiary"}
                  size="s"
                  onClick={() => setWarehouseId(w.id)}
                >
                  {w.name.substring(0, 8)}
                </Button>
              ))}
            </Row>
          </Column>
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Stock
            </Text>
            <Row gap="2">
              <Button
                variant={!lowStockOnly ? "primary" : "tertiary"}
                size="s"
                onClick={() => setLowStockOnly(false)}
              >
                All
              </Button>
              <Button
                variant={lowStockOnly ? "primary" : "tertiary"}
                size="s"
                onClick={() => setLowStockOnly(true)}
              >
                Low
              </Button>
            </Row>
          </Column>
        </Flex>
      </Flex>

      <StockTable stocks={stocks} isLoading={isLoading} />
    </Column>
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
      <Card padding="32" horizontal="center">
        <Text variant="body-default-m" onBackground="neutral-weak">
          No stock items found
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="0" radius="l" overflow="hidden" direction="column" fillWidth>
      <Row padding="16" background="neutral-alpha-weak" border="neutral-alpha-medium">
        <Text variant="label-default-m" style={{ flex: 2 }}>
          Product
        </Text>
        <Text variant="label-default-m" style={{ flex: 1 }}>
          SKU
        </Text>
        <Text variant="label-default-m" style={{ flex: 1, textAlign: "right" }}>
          Unit Cost
        </Text>
        <Text variant="label-default-m" style={{ flex: 1, textAlign: "right" }}>
          On Hand
        </Text>
        <Text variant="label-default-m" style={{ flex: 1, textAlign: "right" }}>
          Reserved
        </Text>
        <Text variant="label-default-m" style={{ flex: 1, textAlign: "right" }}>
          Free to Use
        </Text>
      </Row>
      {stocks.map((stock) => (
        <Row key={stock.id} padding="16" border="neutral-alpha-weak">
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
    </Card>
  );
}
