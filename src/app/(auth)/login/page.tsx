"use client";

import { authApi } from "@/lib/api";
import {
  Button,
  Card,
  Column,
  Flex,
  Grid,
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      setError(err.message || "Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
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
              Sign in to your account
            </Text>
          </Column>

          <form onSubmit={handleSubmit}>
            <Column gap="20">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
              />

              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />

              <Button type="submit" variant="primary" fillWidth loading={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </Column>
          </form>

          <Column gap="12" horizontal="center">
            <Text
              variant="body-default-s"
              onBackground="neutral-weak"
              style={{ cursor: "pointer" }}
            >
              Forgot password?
            </Text>

            <Row gap="4" vertical="center">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Don't have an account?
              </Text>
              <Text
                variant="body-default-s"
                onBackground="brand-strong"
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/register")}
              >
                Sign up
              </Text>
            </Row>
          </Column>
        </Card>
      </Column>
    </Flex>
  );
}
