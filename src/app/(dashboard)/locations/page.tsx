"use client";

import { SkeletonTable } from "@/components/Skeleton";
import { locationsApi, queryKeys, warehousesApi } from "@/lib/api";
import type { Location } from "@/types";
import { Button, Card, Column, Dialog, Flex, Input, Row, Select, Text } from "@once-ui-system/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [warehouseId, setWarehouseId] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
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
      setShowDialog(false);
      setFormData({ name: "", short_code: "", description: "", warehouse_id: "" });
    },
  });

  const locations = locationsData?.data || [];
  const warehouses = warehousesData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Text variant="heading-default-xl">Locations</Text>
        <Button variant="primary" prefixIcon="plus" onClick={() => setShowDialog(true)}>
          New Location
        </Button>
      </Row>

      <Row gap="12" vertical="center">
        <Select
          id="warehouse"
          label="Filter by Warehouse"
          value={warehouseId}
          onSelect={(value: any) => setWarehouseId(value)}
          options={[
            { value: "all", label: "All Warehouses" },
            ...warehouses.map((w) => ({ value: w.id, label: w.name })),
          ]}
        />
      </Row>

      {isLoading ? (
        <SkeletonTable rows={8} columns={5} />
      ) : locations.length === 0 ? (
        <Card padding="32" horizontal="center">
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
        <Card padding="0" radius="l" overflow="hidden" direction="column">
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
                <Button variant="tertiary" size="s">
                  Edit
                </Button>
                <Button variant="tertiary" size="s">
                  Delete
                </Button>
              </Row>
            </Row>
          ))}
        </Card>
      )}

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)} title="New Location">
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
              id="description"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
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
