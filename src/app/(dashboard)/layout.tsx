"use client";

import { authApi } from "@/lib/api";
import { Column, Flex, Icon, Row, Text } from "@once-ui-system/core";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

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
    <Flex fillWidth minHeight="100vh" className="layout-container">
      {/* Mobile Toggle Button */}
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="logo" onClick={() => router.push("/dashboard")}>
          <Icon name="package" size="l" onBackground="brand-strong" />
          <Text variant="heading-default-m">CoreInventory</Text>
        </div>

        {/* Navigation */}
        <nav className="nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  router.push(item.href);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <Icon
                  name={item.icon as any}
                  size="s"
                  onBackground={isActive ? "brand-strong" : "neutral-strong"}
                />
                <Text
                  variant="body-default-m"
                  onBackground={isActive ? "neutral-strong" : "neutral-weak"}
                >
                  {item.label}
                </Text>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button className="nav-item logout" onClick={handleLogout}>
          <Icon name="logOut" size="s" onBackground="neutral-weak" />
          <Text variant="body-default-m" onBackground="neutral-weak">
            Logout
          </Text>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      <style jsx>{`
        .layout-container {
          position: relative;
        }
        .mobile-toggle {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 100;
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: var(--neutral-on-background);
        }
        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 260px;
          min-width: 260px;
          background: #ffffff;
          border-right: 1px solid var(--neutral-alpha-weak);
          display: flex;
          flex-direction: column;
          padding: 16px;
          z-index: 50;
          transition: transform 0.3s ease;
        }
        @media (prefers-color-scheme: dark) {
          .sidebar {
            background: #1e293b;
          }
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 16px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--neutral-alpha-weak);
          cursor: pointer;
        }
        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 4px;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
          color: var(--neutral-on-background-weak);
        }
        .nav-item:hover {
          background: var(--neutral-alpha-weak);
        }
        .nav-item.active {
          background: var(--brand-alpha-weak);
        }
        .nav-item.logout {
          color: var(--neutral-on-background-weak);
          margin-top: auto;
        }
        .main-content {
          flex: 1;
          padding: 32px;
          margin-left: 260px;
          min-height: 100vh;
          width: calc(100% - 260px);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-overlay {
            display: block;
          }
          .sidebar {
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0;
            width: 100%;
            padding: 24px;
            padding-top: 60px;
          }
        }
      `}</style>
    </Flex>
  );
}
