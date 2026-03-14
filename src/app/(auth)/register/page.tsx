"use client";

import { authApi } from "@/lib/api";
import {
  Button,
  Card,
  Column,
  Flex,
  Icon,
  Input,
  Mask,
  MatrixFx,
  Row,
  Text,
} from "@once-ui-system/core";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      }),
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err: Error) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    registerMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Flex
      fillWidth
      minHeight="100vh"
      horizontal="center"
      vertical="center"
      position="relative"
      overflow="hidden"
    >
      <Column
        position="absolute"
        fillWidth
        maxHeight="100dvh"
        aspectRatio="1"
        horizontal="center"
        top="0"
        left="0"
      >
        <Mask maxWidth="m" x={50} y={0} radius={50}>
          <MatrixFx size={1.5} spacing={5} fps={24} colors={["brand-solid-strong"]} flicker />
        </Mask>
      </Column>

      {error && (
        <Flex
          position="fixed"
          fillWidth
          padding="16"
          background="danger-alpha-weak"
          border="danger-medium"
          zIndex={10}
          horizontal="center"
          vertical="center"
        >
          <Row vertical="center" gap="8">
            <Icon name="warningCircle" size="m" onBackground="danger-strong" />
            <Text variant="body-default-m" onBackground="danger-strong">
              {error}
            </Text>
            <Button variant="tertiary" size="s" onClick={() => setError("")}>
              <Icon name="close" size="s" />
            </Button>
          </Row>
        </Flex>
      )}

      <Column
        paddingX="24"
        zIndex={1}
        horizontal="center"
        style={{ width: "100%", maxWidth: "440px" }}
      >
        <Card padding="40" radius="xl" direction="column" gap="24" fillWidth background="page">
          <Column gap="8" horizontal="center">
            <Row gap="8" vertical="center">
              <Icon name="home" size="xl" onBackground="brand-strong" />
              <Text variant="heading-default-xl">CoreInventory</Text>
            </Row>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Create your account
            </Text>
          </Column>

          <form onSubmit={handleSubmit}>
            <Column gap="16">
              <Input
                id="name"
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
              />

              <Input
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
              />

              <Input
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />

              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                fillWidth
                loading={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </Column>
          </form>

          <Column gap="12" horizontal="center">
            <Row gap="4" vertical="center">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Already have an account?
              </Text>
              <Text
                variant="body-default-s"
                onBackground="brand-strong"
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/login")}
              >
                Sign in
              </Text>
            </Row>
          </Column>
        </Card>
      </Column>
    </Flex>
  );
}
