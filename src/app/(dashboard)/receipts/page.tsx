"use client";

import { SkeletonPage, SkeletonTable } from "@/components/Skeleton";
import { queryKeys, receiptsApi, warehousesApi } from "@/lib/api";
import type { Receipt, ReceiptFilters } from "@/types";
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

export default function ReceiptsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    vendor: "",
    warehouse_id: "",
    schedule_date: "",
    reference: "",
    notes: "",
  });

  const filters: ReceiptFilters = {
    search: search || undefined,
    status: status as ReceiptFilters["status"],
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.receipts.list(filters),
    queryFn: () => receiptsApi.list(filters),
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Receipt>) => receiptsApi.create(data),
    onSuccess: (newReceipt) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.all });
      setShowDialog(false);
      setFormData({ vendor: "", warehouse_id: "", schedule_date: "", reference: "", notes: "" });
      router.push(`/receipts/${newReceipt.id}`);
    },
  });

  const receipts = data?.data || [];
  const warehouses = warehousesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Receipts</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setShowDialog(true)}>
          New Receipt
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
              placeholder="Search receipts..."
            />
          </Column>
          <Column gap="4">
            <Text variant="label-default-xs" onBackground="neutral-weak">
              Status
            </Text>
            <Row gap="2">
              {["all", "draft", "ready", "done"].map((s) => (
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
        <ReceiptsTable receipts={receipts} onRowClick={(id) => router.push(`/receipts/${id}`)} />
      ) : (
        <ReceiptsKanban receipts={receipts} onCardClick={(id) => router.push(`/receipts/${id}`)} />
      )}

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} title="New Receipt">
        <form onSubmit={handleSubmit}>
          <Column gap="16" fillWidth>
            <Input
              id="reference"
              label="Reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              required
              placeholder="e.g., REC-001"
            />
            <Input
              id="vendor"
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="Enter vendor name"
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

interface ReceiptsTableProps {
  receipts: Receipt[];
  onRowClick: (id: string) => void;
}

function ReceiptsTable({ receipts, onRowClick }: ReceiptsTableProps) {
  if (receipts.length === 0) {
    return (
      <Card padding="32" horizontal="center" fillWidth>
        <Text variant="body-default-m" onBackground="neutral-weak">
          No receipts found
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
          From
        </Text>
        <Text variant="label-default-m" style={{ flex: 1 }}>
          To
        </Text>
        <Text variant="label-default-m" style={{ flex: 1 }}>
          Date
        </Text>
        <Text variant="label-default-m" style={{ width: "100px" }}>
          Status
        </Text>
      </Row>
      {receipts.map((receipt) => (
        <Row
          key={receipt.id}
          padding="16"
          border="neutral-alpha-weak"
          onClick={() => onRowClick(receipt.id)}
          style={{ cursor: "pointer" }}
        >
          <Text variant="body-default-m" style={{ flex: 1 }} onBackground="brand-strong">
            {receipt.reference}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }}>
            {receipt.vendor || "-"}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }}>
            {receipt.warehouse?.name || "-"}
          </Text>
          <Text variant="body-default-m" style={{ flex: 1 }}>
            {receipt.schedule_date ? new Date(receipt.schedule_date).toLocaleDateString() : "-"}
          </Text>
          <Text variant="label-default-s" style={{ width: "100px" }}>
            {receipt.status}
          </Text>
        </Row>
      ))}
    </Card>
  );
}

interface ReceiptsKanbanProps {
  receipts: Receipt[];
  onCardClick: (id: string) => void;
}

function ReceiptsKanban({ receipts, onCardClick }: ReceiptsKanbanProps) {
  const columns = ["draft", "ready", "done"];

  const grouped = columns.reduce(
    (acc, status) => {
      acc[status] = receipts.filter((r) => r.status === status);
      return acc;
    },
    {} as Record<string, Receipt[]>,
  );

  return (
    <Grid columns={3} gap="16" m={{ columns: 1 }} s={{ columns: 1 }}>
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
            {grouped[status]?.map((receipt) => (
              <Card
                key={receipt.id}
                padding="16"
                radius="m"
                direction="column"
                gap="4"
                onClick={() => onCardClick(receipt.id)}
                style={{ cursor: "pointer" }}
                fillWidth
              >
                <Text variant="body-default-m">{receipt.reference}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {receipt.vendor || "No vendor"}
                </Text>
              </Card>
            ))}
          </Column>
        </Column>
      ))}
    </Grid>
  );
}
