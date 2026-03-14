"use client";

import { SkeletonTable } from "@/components/Skeleton";
import { movesApi, queryKeys, warehousesApi } from "@/lib/api";
import { type MoveFilters, StockMove } from "@/types";
import { Button, Card, Column, Flex, Input, Row, Text } from "@once-ui-system/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Move History</Text>
      </Row>
      <Card padding="16" radius="l" fillWidth>
        <Flex gap="16" wrap m={{ direction: "column" }} s={{ direction: "column" }}>
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Search
            </Text>
            <Input
              id="search"
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search product..."
            />
          </Column>

          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Type
            </Text>
            <Row gap="2">
              {["all", "receipt", "delivery", "adjustment"].map((t) => (
                <Button
                  key={t}
                  variant={(filters.move_type || "all") === t ? "primary" : "tertiary"}
                  size="s"
                  onClick={() => updateFilter("move_type", t)}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </Row>
          </Column>

          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Warehouse
            </Text>
            <Row gap="2">
              <Button
                variant={(filters.warehouse_id || "all") === "all" ? "primary" : "tertiary"}
                size="s"
                onClick={() => updateFilter("warehouse_id", "all")}
              >
                All
              </Button>
              {warehouses.slice(0, 3).map((w) => (
                <Button
                  key={w.id}
                  variant={(filters.warehouse_id || "all") === w.id ? "primary" : "tertiary"}
                  size="s"
                  onClick={() => updateFilter("warehouse_id", w.id)}
                >
                  {w.name.substring(0, 8)}
                </Button>
              ))}
            </Row>
          </Column>

          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Date
            </Text>
            <Row gap="8">
              <Input
                id="date_from"
                type="date"
                value={filters.date_from || ""}
                onChange={(e) => updateFilter("date_from", e.target.value)}
                style={{ width: "140px" }}
              />
              <Input
                id="date_to"
                type="date"
                value={filters.date_to || ""}
                onChange={(e) => updateFilter("date_to", e.target.value)}
                style={{ width: "140px" }}
              />
            </Row>
          </Column>
        </Flex>
      </Card>

      {isLoading ? (
        <SkeletonTable rows={8} columns={6} />
      ) : moves.length === 0 ? (
        <Card padding="32" horizontal="center" fillWidth>
          <Text variant="body-default-m" onBackground="neutral-weak">
            No movements found
          </Text>
        </Card>
      ) : (
        <Card padding="0" radius="l" overflow="hidden" direction="column" fillWidth>
          <Row padding="16" background="neutral-alpha-weak" border="neutral-alpha-medium">
            <Text variant="label-default-m" style={{ flex: 1 }}>
              Date
            </Text>
            <Text variant="label-default-m" style={{ flex: 1.5 }}>
              Product
            </Text>
            <Text variant="label-default-m" style={{ width: "80px", textAlign: "right" }}>
              Qty
            </Text>
            <Text variant="label-default-m" style={{ width: "100px" }}>
              Type
            </Text>
            <Text variant="label-default-m" style={{ flex: 1 }}>
              From
            </Text>
            <Text variant="label-default-m" style={{ flex: 1 }}>
              To
            </Text>
          </Row>
          {moves.map((move) => (
            <Row key={move.id} padding="16" border="neutral-alpha-weak">
              <Text variant="body-default-s" style={{ flex: 1 }} onBackground="neutral-weak">
                {new Date(move.createdAt).toLocaleDateString()}
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
              <Text variant="label-default-s" style={{ width: "100px" }}>
                {move.move_type}
              </Text>
              <Text variant="body-default-s" style={{ flex: 1 }} onBackground="neutral-weak">
                {move.from_warehouse?.name || move.from_location?.name || "-"}
              </Text>
              <Text variant="body-default-s" style={{ flex: 1 }} onBackground="neutral-weak">
                {move.to_warehouse?.name || move.to_location?.name || "-"}
              </Text>
            </Row>
          ))}
        </Card>
      )}
    </Column>
  );
}
