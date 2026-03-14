"use client";

import { SkeletonPage } from "@/components/Skeleton";
import { queryKeys, warehousesApi } from "@/lib/api";
import type { Warehouse } from "@/types";
import { Button, Card, Column, Dialog, Flex, Grid, Input, Row, Text } from "@once-ui-system/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WarehousesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: "", short_code: "", address: "" });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Warehouse>) => warehousesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.list });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Warehouse> }) =>
      warehousesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.list });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehousesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.list });
    },
  });

  const warehouses = data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingWarehouse(null);
    setFormData({ name: "", short_code: "", address: "" });
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      short_code: warehouse.short_code,
      address: warehouse.address || "",
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this warehouse?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Warehouses</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setShowDialog(true)}>
          New Warehouse
        </Button>
      </Row>

      {isLoading ? (
        <SkeletonPage variant="cards" />
      ) : warehouses.length === 0 ? (
        <Card padding="32" horizontal="center" fillWidth>
          <Column gap="12" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No warehouses found
            </Text>
            <Button variant="secondary" onClick={() => setShowDialog(true)}>
              Create First Warehouse
            </Button>
          </Column>
        </Card>
      ) : (
        <Grid columns={3} gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
          {warehouses.map((warehouse) => (
            <WarehouseCard
              key={warehouse.id}
              warehouse={warehouse}
              onView={() => router.push(`/warehouses/${warehouse.id}`)}
              onEdit={() => openEditDialog(warehouse)}
              onDelete={() => handleDelete(warehouse.id)}
            />
          ))}
        </Grid>
      )}

      <Dialog
        isOpen={showDialog}
        onClose={closeDialog}
        title={editingWarehouse ? "Edit Warehouse" : "New Warehouse"}
      >
        <form onSubmit={handleSubmit}>
          <Column gap="16" fillWidth>
            <Input
              id="name"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter warehouse name"
            />
            <Input
              id="short_code"
              label="Short Code"
              value={formData.short_code}
              onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
              required
              placeholder="e.g., WH01"
            />
            <Input
              id="address"
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
            />
          </Column>
        </form>
        <Flex gap="12" justifyContent="flexEnd" marginTop="24">
          <Button variant="tertiary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editingWarehouse ? "Save" : "Create"}
          </Button>
        </Flex>
      </Dialog>
    </Column>
  );
}

interface WarehouseCardProps {
  warehouse: Warehouse;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function WarehouseCard({ warehouse, onView, onEdit, onDelete }: WarehouseCardProps) {
  return (
    <Card padding="20" radius="l" direction="column" gap="16" fillWidth>
      <Row vertical="center" horizontal="between">
        <Column gap="4">
          <Text variant="heading-default-m">{warehouse.name}</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {warehouse.short_code}
          </Text>
        </Column>
      </Row>

      <Text variant="body-default-s" onBackground="neutral-weak">
        {warehouse.address || "No address"}
      </Text>

      <Row vertical="center" horizontal="between">
        <Text variant="label-default-s" onBackground="neutral-weak">
          Locations
        </Text>
        <Text variant="body-default-m">{warehouse.locations_count || 0}</Text>
      </Row>

      <Row gap="8">
        <Button variant="secondary" size="s" fillWidth onClick={onView}>
          View
        </Button>
        <Button variant="tertiary" size="s" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="tertiary" size="s" onClick={onDelete}>
          Delete
        </Button>
      </Row>
    </Card>
  );
}
