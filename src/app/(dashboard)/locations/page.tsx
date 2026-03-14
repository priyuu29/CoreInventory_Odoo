"use client";

import { locationsApi, queryKeys, warehousesApi } from "@/lib/api";
import type { Location } from "@/types";
import { Button, Card, Column, Dialog, Flex, Input, Row, Text } from "@once-ui-system/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [warehouseId, setWarehouseId] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    description: "",
    warehouse_id: "",
  });

  const { data: locationsData, isLoading } = useQuery({
    queryKey: queryKeys.locations.list(warehouseId !== "all" ? warehouseId : undefined),
    queryFn: () => locationsApi.list(warehouseId !== "all" ? warehouseId : undefined),
  });

  const { data: warehousesData } = useQuery({
    queryKey: queryKeys.warehouses.list,
    queryFn: () => warehousesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Location>) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Location> }) =>
      locationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
    },
  });

  const locations = locationsData?.data || [];
  const warehouses = warehousesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingLocation(null);
    setFormData({ name: "", short_code: "", description: "", warehouse_id: "" });
  };

  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      short_code: location.short_code,
      description: location.description || "",
      warehouse_id: location.warehouse?.id || "",
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Locations</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setShowDialog(true)}>
          New Location
        </Button>
      </Row>

      <Card padding="16" radius="m" fillWidth>
        <Flex gap="12" wrap vertical="center">
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
        </Flex>
      </Card>

      {isLoading ? (
        <Card padding="32" horizontal="center" fillWidth>
          <Text variant="body-default-m">Loading...</Text>
        </Card>
      ) : locations.length === 0 ? (
        <Card padding="32" horizontal="center" fillWidth>
          <Column gap="12" horizontal="center">
            <Text variant="body-default-m" onBackground="neutral-weak">
              No locations found
            </Text>
            <Button variant="secondary" onClick={() => setShowDialog(true)}>
              Create First Location
            </Button>
          </Column>
        </Card>
      ) : (
        <Card padding="0" radius="m" overflow="hidden" fillWidth direction="column">
          <Row padding="16" background="neutral-alpha-weak" border="neutral-alpha-medium">
            <Text variant="label-default-m" style={{ flex: 1 }}>
              Name
            </Text>
            <Text variant="label-default-m" style={{ flex: 1 }}>
              Short Code
            </Text>
            <Text variant="label-default-m" style={{ flex: 1 }}>
              Warehouse
            </Text>
            <Text variant="label-default-m" style={{ flex: 1 }}>
              Description
            </Text>
            <Text variant="label-default-m" style={{ width: "150px" }}>
              Actions
            </Text>
          </Row>
          {locations.map((location) => (
            <Row key={location.id} padding="16" border="neutral-alpha-weak">
              <Text variant="body-default-m" style={{ flex: 1 }}>
                {location.name}
              </Text>
              <Text variant="label-default-s" style={{ flex: 1 }} onBackground="neutral-weak">
                {location.short_code}
              </Text>
              <Text variant="body-default-s" style={{ flex: 1 }}>
                {location.warehouse?.name || "-"}
              </Text>
              <Text variant="body-default-s" style={{ flex: 1 }} onBackground="neutral-weak">
                {location.description || "-"}
              </Text>
              <Row gap="4" style={{ width: "150px" }}>
                <Button variant="tertiary" size="s" onClick={() => openEditDialog(location)}>
                  Edit
                </Button>
                <Button variant="tertiary" size="s" onClick={() => handleDelete(location.id)}>
                  Delete
                </Button>
              </Row>
            </Row>
          ))}
        </Card>
      )}

      <Dialog
        isOpen={showDialog}
        onClose={closeDialog}
        title={editingLocation ? "Edit Location" : "New Location"}
      >
        <form onSubmit={handleSubmit}>
          <Column gap="16" fillWidth>
            <Input
              id="name"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter location name"
            />
            <Input
              id="short_code"
              label="Short Code"
              value={formData.short_code}
              onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
              required
              placeholder="e.g., A-01-01"
            />
            <Input
              id="description"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
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
            {editingLocation ? "Save" : "Create"}
          </Button>
        </Flex>
      </Dialog>
    </Column>
  );
}
