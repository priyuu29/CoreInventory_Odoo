"use client";

import { Button, Column, Flex, Icon, Row, Text } from "@once-ui-system/core";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo" onClick={() => (window.location.href = "/")}>
            <Icon name="package" size="l" onBackground="brand-strong" />
            <span className="logo-text">CoreInventory</span>
          </div>
          <nav className="nav-buttons">
            <Button variant="tertiary" href="/login">
              Login
            </Button>
            <Button variant="primary" href="/register">
              Register
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Inventory Management System</div>
          <h1 className="hero-title">
            Smart Inventory
            <br />
            Management
          </h1>
          <p className="hero-subtitle">
            Track your stock, manage warehouses, and streamline operations with CoreInventory. Built
            for modern businesses.
          </p>
          <div className="hero-buttons">
            <Button variant="primary" href="/dashboard" size="l">
              Get Started
            </Button>
            <Button variant="secondary" href="/login" size="l">
              Sign In
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">
              <Icon name="database" size="m" onBackground="brand-strong" />
            </div>
            <h3>Warehouses</h3>
            <p>Multiple warehouse support for organized inventory management</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Icon name="package" size="m" onBackground="success-strong" />
            </div>
            <h3>Stock Tracking</h3>
            <p>Real-time inventory levels with detailed analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Icon name="arrowDownLeft" size="m" onBackground="warning-strong" />
            </div>
            <h3>Receipts & Deliveries</h3>
            <p>Complete transaction history and workflow management</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>CoreInventory - Built with Once UI</p>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--surface);
          border-bottom: 1px solid var(--neutral-alpha-weak);
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 600;
          color: var(--neutral-on-background);
        }
        .nav-buttons {
          display: flex;
          gap: 12px;
        }
        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 32px 60px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .hero-content {
          text-align: center;
          margin-bottom: 60px;
        }
        .hero-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--brand-alpha-weak);
          color: var(--brand-on-background);
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: 56px;
          font-weight: 700;
          line-height: 1.1;
          color: var(--neutral-on-background);
          margin-bottom: 24px;
        }
        .hero-subtitle {
          font-size: 18px;
          color: var(--neutral-on-background-weak);
          max-width: 560px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          max-width: 1000px;
        }
        .feature-card {
          background: var(--surface);
          border: 1px solid var(--neutral-alpha-medium);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          transition: all 0.2s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px var(--shadow, rgba(0, 0, 0, 0.12));
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--neutral-alpha-weak);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .feature-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--neutral-on-background);
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 14px;
          color: var(--neutral-on-background-weak);
          line-height: 1.5;
        }
        .footer {
          padding: 24px;
          text-align: center;
          border-top: 1px solid var(--neutral-alpha-weak);
        }
        .footer p {
          font-size: 14px;
          color: var(--neutral-on-background-weak);
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 16px;
          }
          .hero {
            padding: 100px 16px 40px;
          }
          .hero-title {
            font-size: 36px;
          }
          .hero-subtitle {
            font-size: 16px;
          }
          .hero-buttons {
            flex-direction: column;
          }
          .features {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .feature-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
