"use client";

import { authApi } from "@/lib/api";
import { Button, Column, Flex, Icon, Row, Text } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/receipts", label: "Receipts", icon: "arrowDownLeft" },
  { href: "/deliveries", label: "Deliveries", icon: "arrowUpRight" },
  { href: "/stocks", label: "Stocks", icon: "package" },
  { href: "/warehouses", label: "Warehouses", icon: "database" },
  { href: "/locations", label: "Locations", icon: "folder" },
  { href: "/moves", label: "Moves", icon: "arrowRight" },
];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <Flex fillWidth minHeight="100vh">
      {/* Mobile Toggle Button */}
      <Flex
        as="button"
        position="fixed"
        top="12"
        left="12"
        zIndex={10}
        background="surface"
        border="neutral-alpha-medium"
        radius="m"
        padding="8"
        style={{ display: "none" }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-toggle"
      >
        <Icon name="menu" size="m" />
      </Flex>

      {/* Sidebar */}
      <Flex
        direction="column"
        fillHeight
        padding="16"
        gap="8"
        background="surface"
        border="neutral-alpha-weak"
        position="sticky"
        top="0"
        style={{
          width: "240px",
          minWidth: "240px",
          height: "100vh",
        }}
        className="sidebar"
      >
        {/* Logo */}
        <Row
          gap="8"
          vertical="center"
          paddingBottom="16"
          border="neutral-alpha-weak"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/dashboard")}
        >
          <Icon name="package" size="l" onBackground="brand-strong" />
          <Text variant="heading-default-m">CoreInventory</Text>
        </Row>

        {/* Navigation */}
        <Column gap="4" flex={1}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "tertiary"}
              size="l"
              fillWidth
              href={item.href}
              onClick={() => setSidebarOpen(false)}
            >
              <Flex gap="8" align="center" style={{ justifyContent: "flex-start" }}>
                <Icon name={item.icon as any} size="s" />
                <Text variant="body-default-m">{item.label}</Text>
              </Flex>
            </Button>
          ))}
        </Column>

        {/* Logout */}
        <Button variant="tertiary" size="l" fillWidth onClick={handleLogout}>
          <Flex gap="8" align="center" style={{ justifyContent: "flex-start" }}>
            <Icon name="logOut" size="s" />
            <Text variant="body-default-m">Logout</Text>
          </Flex>
        </Button>
      </Flex>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          fillWidth
          fillHeight
          background="neutral-alpha-weak"
          zIndex={5}
          style={{ cursor: "pointer" }}
          onClick={() => setSidebarOpen(false)}
          className="mobile-overlay"
        />
      )}

      {/* Main Content */}
      <Column flex={1} padding="24" className="main-content">
        {children}
      </Column>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-toggle {
            display: flex !important;
          }
          .sidebar {
            position: fixed !important;
            left: ${sidebarOpen ? "0" : "-260px"};
            transition: left 0.3s ease;
            z-index: 10;
          }
          .mobile-overlay {
            display: flex !important;
          }
          .main-content {
            padding-top: 60px !important;
          }
        }
      `}</style>
    </Flex>
  );
}
