"use client";

import { queryKeys, receiptsApi } from "@/lib/api";
import { Button, Card, Column, Grid, Input, Row, Text } from "@once-ui-system/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import React from "react";

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = React.use(params);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vendor: "",
    warehouse_id: "",
    schedule_date: "",
    reference: "",
    notes: "",
  });

  const { data: receipt, isLoading } = useQuery({
    queryKey: queryKeys.receipts.detail(id),
    queryFn: () => receiptsApi.get(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => receiptsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts.detail(id) });
      setIsEditing(false);
    },
  });

  const startEdit = () => {
    if (receipt) {
      setFormData({
        vendor: receipt.vendor || "",
        warehouse_id: receipt.warehouse?.id || "",
        schedule_date: receipt.schedule_date ? receipt.schedule_date.split("T")[0] : "",
        reference: receipt.reference || "",
        notes: receipt.notes || "",
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Column fillWidth padding="24" horizontal="center">
        <Text variant="body-default-m">Loading receipt...</Text>
      </Column>
    );
  }

  if (!receipt) {
    return (
      <Column fillWidth padding="24" horizontal="center">
        <Text variant="body-default-m">Receipt not found</Text>
        <Button variant="secondary" onClick={() => router.push("/receipts")}>
          Back to Receipts
        </Button>
      </Column>
    );
  }

  return (
    <Column fillWidth gap="24" padding="24">
      <Row vertical="center" horizontal="between">
        <Row gap="16" vertical="center">
          <Button
            variant="tertiary"
            prefixIcon="arrowLeft"
            onClick={() => router.push("/receipts")}
          >
            Back
          </Button>
          <Text variant="heading-default-xl">{receipt.reference}</Text>
        </Row>
        <Row gap="8">
          {isEditing ? (
            <>
              <Button variant="tertiary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={updateMutation.isPending}>
                Save
              </Button>
            </>
          ) : (
            <>
              {receipt.status === "draft" && (
                <Button variant="secondary" onClick={startEdit}>
                  Edit
                </Button>
              )}
              {receipt.status === "ready" && <Button variant="primary">Complete</Button>}
            </>
          )}
        </Row>
      </Row>

      <Card padding="16" radius="m" fillWidth direction="column" gap="16">
        <Text variant="heading-default-s">Details</Text>
        {isEditing ? (
          <Column gap="16">
            <Input
              label="Reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
            <Input
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
            <Input
              label="Schedule Date"
              type="date"
              value={formData.schedule_date}
              onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
            />
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Column>
        ) : (
          <Grid columns={2} gap="16" m={{ columns: 1 }} fillWidth>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Vendor
              </Text>
              <Text variant="body-default-m">{receipt.vendor || "-"}</Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Warehouse
              </Text>
              <Text variant="body-default-m">{receipt.warehouse?.name || "-"}</Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Status
              </Text>
              <Text variant="body-default-m">{receipt.status}</Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Scheduled Date
              </Text>
              <Text variant="body-default-m">
                {receipt.schedule_date ? new Date(receipt.schedule_date).toLocaleDateString() : "-"}
              </Text>
            </Column>
            <Column gap="4">
              <Text variant="label-default-s" onBackground="neutral-weak">
                Notes
              </Text>
              <Text variant="body-default-m">{receipt.notes || "-"}</Text>
            </Column>
          </Grid>
        )}
      </Card>

      <Card padding="16" radius="m" fillWidth direction="column" gap="12">
        <Text variant="heading-default-s">Items</Text>
        {receipt.items && receipt.items.length > 0 ? (
          <Card padding="0" radius="m" overflow="hidden">
            <Row padding="12" background="neutral-alpha-weak" border="neutral-alpha-medium">
              <Text variant="label-default-m" style={{ flex: 1 }}>
                Product
              </Text>
              <Text variant="label-default-m" style={{ width: "100px" }}>
                Qty
              </Text>
            </Row>
            {receipt.items.map((item: any, index: number) => (
              <Row key={index} padding="12" border="neutral-alpha-weak">
                <Text variant="body-default-m" style={{ flex: 1 }}>
                  {item.product?.name || "-"}
                </Text>
                <Text variant="body-default-m" style={{ width: "100px" }}>
                  {item.quantity}
                </Text>
              </Row>
            ))}
          </Card>
        ) : (
          <Text variant="body-default-s" onBackground="neutral-weak">
            No items
          </Text>
        )}
      </Card>
    </Column>
  );
}
