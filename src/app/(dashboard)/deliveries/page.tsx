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
  Icon,
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
    <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <Column fillWidth gap="24">
        {/* Header */}
        <Row vertical="center" horizontal="between">
          <Text variant="heading-default-xl">Deliveries</Text>
          <Button
            variant="primary"
            prefixIcon="plus"
            onClick={() => setShowDialog(true)}
            className="new-delivery-btn"
          >
            New Delivery
          </Button>
        </Row>

        {/* Filters */}
        <Flex gap="16" wrap vertical="center" className="filters">
          <div className="search-wrapper">
            <Icon name="search" size="s" onBackground="neutral-weak" />
            <input
              type="text"
              className="search-input"
              placeholder="Search deliveries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="status-filters">
            {["all", "draft", "waiting", "ready", "done"].map((s) => (
              <button
                key={s}
                className={`filter-chip ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              className={`view-btn ${view === "kanban" ? "active" : ""}`}
              onClick={() => setView("kanban")}
            >
              Kanban
            </button>
          </div>
        </Flex>

        {/* Content */}
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

        {/* Dialog */}
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

      <style jsx>{`
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
        .status-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-chip {
          padding: 6px 12px;
          border-radius: 20px;
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          font-size: 13px;
          color: var(--neutral-on-background-weak);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-chip:hover {
          background: var(--neutral-alpha-weak);
        }
        .filter-chip.active {
          background: var(--brand);
          color: var(--brand-on-solid);
          border-color: var(--brand);
        }
        .view-toggle {
          display: flex;
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 8px;
          overflow: hidden;
        }
        .view-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--neutral-on-background-weak);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .view-btn:hover {
          background: var(--neutral-alpha-weak);
        }
        .view-btn.active {
          background: var(--brand);
          color: var(--brand-on-solid);
        }
        .new-delivery-btn {
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
            align-items: flex-start;
          }
          .search-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
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
    <div className="table-container">
      <Row padding="16" className="table-header">
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          Reference
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          Destination
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1 }}>
          Warehouse
        </Text>
        <Text variant="label-default-xs" style={{ flex: 1, textAlign: "center" }}>
          Date
        </Text>
        <Text variant="label-default-xs" style={{ width: "100px", textAlign: "right" }}>
          Status
        </Text>
      </Row>
      {deliveries.map((delivery) => (
        <Row
          key={delivery.id}
          padding="16"
          className="table-row"
          onClick={() => onRowClick(delivery.id)}
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
          <Text variant="body-default-m" style={{ flex: 1, textAlign: "center" }}>
            {delivery.schedule_date ? new Date(delivery.schedule_date).toLocaleDateString() : "-"}
          </Text>
          <div style={{ width: "100px", textAlign: "right" }}>
            <StatusBadge status={delivery.status} />
          </div>
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
        }
        .table-row:hover {
          background: var(--neutral-alpha-weak);
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-draft {
          background: var(--neutral-alpha-weak);
          color: var(--neutral-on-background);
        }
        .badge-waiting {
          background: var(--warning-alpha-weak);
          color: var(--warning-on-background);
        }
        .badge-ready {
          background: var(--success-alpha-weak);
          color: var(--success-on-background);
        }
        .badge-done {
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background);
        }
        .badge-late {
          background: var(--danger-alpha-weak);
          color: var(--danger-on-background);
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    draft: { label: "Draft", class: "badge-draft" },
    waiting: { label: "Waiting", class: "badge-waiting" },
    ready: { label: "Ready", class: "badge-ready" },
    done: { label: "Done", class: "badge-done" },
    late: { label: "Late", class: "badge-late" },
  };

  const { label, class: badgeClass } = config[status] || { label: status, class: "badge-draft" };

  return <span className={`status-badge ${badgeClass}`}>{label}</span>;
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
                className="kanban-card"
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
      <style jsx>{`
        .kanban-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .kanban-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadow, rgba(0, 0, 0, 0.15));
        }
      `}</style>
    </Grid>
  );
}
