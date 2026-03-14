"use client";

import { SkeletonPage, SkeletonTable } from "@/components/Skeleton";
import { deliveriesApi, queryKeys, warehousesApi } from "@/lib/api";
import type { Delivery, DeliveryFilters } from "@/types";
import {
  Button,
  Card,
  Column,
  Dialog,
  Flex,
  Grid,
  Input,
  Row,
  Select,
  Text,
} from "@once-ui-system/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeliveriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    warehouse_id: "",
    schedule_date: "",
    reference: "",
    notes: "",
  });

  const filters: DeliveryFilters = {
    search: search || undefined,
    status: status as DeliveryFilters["status"],
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.deliveries.list(filters),
    queryFn: () => deliveriesApi.list(filters),
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Delivery>) => deliveriesApi.create(data),
    onSuccess: (newDelivery) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.all });
      setShowDialog(false);
      setFormData({ customer: "", warehouse_id: "", schedule_date: "", reference: "", notes: "" });
      router.push(`/deliveries/${newDelivery.id}`);
    },
  });

  const deliveries = data?.data || [];
  const warehouses = warehousesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Deliveries</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setShowDialog(true)}>
          New Delivery
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
              placeholder="Search deliveries..."
            />
          </Column>
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Status
            </Text>
            <Row gap="2">
              {["all", "draft", "waiting", "ready", "done"].map((s) => (
                <Button
                  key={s}
                  variant={status === s ? "primary" : "tertiary"}
                  size="s"
                  onClick={() => setStatus(s)}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </Row>
          </Column>
        </Flex>
        <Row gap="4">
          <Button
            variant={view === "list" ? "primary" : "tertiary"}
            size="s"
            onClick={() => setView("list")}
          >
            List
          </Button>
          <Button
            variant={view === "kanban" ? "primary" : "tertiary"}
            size="s"
            onClick={() => setView("kanban")}
          >
            Kanban
          </Button>
        </Row>
      </Flex>

      {isLoading ? (
        view === "list" ? (
          <SkeletonTable rows={8} columns={5} />
        ) : (
          <SkeletonPage variant="kanban" />
        )
      ) : view === "list" ? (
        <DeliveriesTable
          deliveries={deliveries}
          onRowClick={(id) => router.push(`/deliveries/${id}`)}
        />
      ) : (
        <DeliveriesKanban
          deliveries={deliveries}
          onCardClick={(id) => router.push(`/deliveries/${id}`)}
        />
      )}

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} title="New Delivery">
        <form onSubmit={handleSubmit}>
          <Column gap="16" fillWidth>
            <Input
              id="reference"
              label="Reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              required
              placeholder="e.g., DEL-001"
            />
            <Input
              id="customer"
              label="Customer"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              placeholder="Enter customer name"
            />
            <Select
              id="warehouse_id"
              label="Warehouse"
              value={formData.warehouse_id}
              onSelect={(value: any) => setFormData({ ...formData, warehouse_id: value })}
              required
              options={[
                { value: "", label: "Select Warehouse" },
                ...warehouses.map((w) => ({ value: w.id, label: w.name })),
              ]}
            />
            <Input
              id="schedule_date"
              label="Schedule Date"
              type="date"
              value={formData.schedule_date}
              onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
            />
            <Input
              id="notes"
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter notes"
            />
          </Column>
        </form>
        <Flex gap="12" style={{ justifyContent: "flex-end", marginTop: "24" }}>
          <Button variant="tertiary" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={createMutation.isPending}>
            Create
          </Button>
        </Flex>
      </Dialog>
    </Column>
  );
}

interface DeliveriesTableProps {
  deliveries: Delivery[];
  onRowClick: (id: string) => void;
}

function DeliveriesTable({ deliveries, onRowClick }: DeliveriesTableProps) {
  if (deliveries.length === 0) {
    return (
      <Card padding="32" horizontal="center" fillWidth>
        <Text variant="body-default-m" onBackground="neutral-weak">
          No deliveries found
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="0" radius="l" overflow="hidden" direction="column" fillWidth>
      <Row padding="16" background="neutral-alpha-weak" border="neutral-alpha-medium">
        <Text variant="label-default-m" style={{ flex: 1 }}>
          Reference
        </Text>
        <Text variant="label-default-m" style={{ flex: 1 }}>
          Destination
        </Text>
        <Text variant="label-default-m" style={{ flex: 1 }}>
          Warehouse
        </Text>
        <Text variant="label-default-m" style={{ flex: 1 }}>
          Date
        </Text>
        <Text variant="label-default-m" style={{ width: "100px" }}>
          Status
        </Text>
      </Row>
      {deliveries.map((delivery) => (
        <Row
          key={delivery.id}
          padding="16"
          border="neutral-alpha-weak"
          onClick={() => onRowClick(delivery.id)}
          style={{ cursor: "pointer" }}
        >
          <Text variant="body-default-m" style={{ flex: 1 }} onBackground="brand-strong">
            {delivery.reference}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }}>
            {delivery.destination || "-"}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }}>
            {delivery.warehouse?.name || "-"}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }}>
            {delivery.schedule_date ? new Date(delivery.schedule_date).toLocaleDateString() : "-"}
          </Text>
          <Text variant="label-default-s" style={{ width: "100px" }}>
            {delivery.status}
          </Text>
        </Row>
      ))}
    </Card>
  );
}

interface DeliveriesKanbanProps {
  deliveries: Delivery[];
  onCardClick: (id: string) => void;
}

function DeliveriesKanban({ deliveries, onCardClick }: DeliveriesKanbanProps) {
  const columns = ["draft", "waiting", "ready", "done"];

  const grouped = columns.reduce(
    (acc, status) => {
      acc[status] = deliveries.filter((d) => d.status === status);
      return acc;
    },
    {} as Record<string, Delivery[]>,
  );

  return (
    <Grid columns={4} gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
      {columns.map((status) => (
        <Column key={status} gap="12" fillWidth>
          <Card padding="12" radius="m" background="neutral-alpha-weak" fillWidth>
            <Row vertical="center" horizontal="between">
              <Text variant="label-default-m" style={{ textTransform: "capitalize" }}>
                {status}
              </Text>
              <Text variant="label-default-s">{grouped[status]?.length || 0}</Text>
            </Row>
          </Card>
          <Column gap="8">
            {grouped[status]?.map((delivery) => (
              <Card
                key={delivery.id}
                padding="16"
                radius="m"
                direction="column"
                gap="4"
                onClick={() => onCardClick(delivery.id)}
                style={{ cursor: "pointer" }}
                fillWidth
              >
                <Text variant="body-default-m">{delivery.reference}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {delivery.destination || "No destination"}
                </Text>
              </Card>
            ))}
          </Column>
        </Column>
      ))}
    </Grid>
  );
}
