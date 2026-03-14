# Global UI Styles - Once UI System

## Installation

```bash
npm install @once-ui-system/core @tanstack/react-query @tanstack/react-query-devtools
```

## Theme Configuration

Once UI uses semantic tokens - no Tailwind needed.

### Available Tokens

| Category | Tokens |
|----------|--------|
| Brand Colors | blue, indigo, violet, magenta, pink, red, orange, yellow, moss, green, emerald, aqua, cyan |
| Neutral Colors | sand, gray, slate |
| Spacing | 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Border Radius | xs, s, m, l, xl, 2xl, full |
| Typography | label-default-xs, label-default-s, label-default-m, body-default-xs, body-default-s, body-default-m, body-default-l, heading-default-xs, heading-default-s, heading-default-m, heading-default-l |

## Layout Components (Semantic Props)

Once UI provides semantic layout components:

```tsx
import { Row, Column, Grid, Stack } from "@once-ui-system/core";

// Horizontal layout
<Row gap="16" vertical="center">...</Row>

// Vertical layout  
<Column gap="16" horizontal="center">...</Column>

// Grid layout
<Grid columns="3" gap="24" fillWidth>...</Grid>
```

## Core Components

### Button
```tsx
import { Button } from "@once-ui-system/core";

<Button variant="primary" size="m">Primary</Button>
<Button variant="secondary" size="m">Secondary</Button>
<Button variant="tertiary" size="m">Tertiary</Button>
<Button variant="danger" size="m">Danger</Button>
```

### Input
```tsx
import { Input } from "@once-ui-system/core";

<Input id="email" label="Email" placeholder="Enter email" />
<Input id="password" type="password" label="Password" />
```

### Card
```tsx
import { Card, Text, Row, Column } from "@once-ui-system/core";

<Card padding="24" radius="l" direction="column">
  <Text variant="heading-default-m">Title</Text>
  <Text variant="body-default-s">Content</Text>
</Card>
```

### Dialog (Modal)
```tsx
import { Dialog, Button } from "@once-ui-system/core";

const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open</Button>
  <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Title">
    Content
  </Dialog>
</>
```

### Badge (Status)
```tsx
import { Badge } from "@once-ui-system/core";

<Badge variant="brand">Draft</Badge>
<Badge variant="success">Done</Badge>
<Badge variant="warning">Waiting</Badge>
<Badge variant="danger">Late</Badge>
```

### Table
```tsx
import { Table, Thead, Tbody, Tr, Th, Td } from "@once-ui-system/core";

<Table>
  <Thead>
    <Tr>
      <Th>Name</Th>
      <Th>Status</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr>
      <Td>Item 1</Td>
      <Td><Badge variant="success">Active</Badge></Td>
    </Tr>
  </Tbody>
</Table>
```

### Avatar
```tsx
import { Avatar } from "@once-ui-system/core";

<Avatar size="m" name="John Doe" />
<Avatar size="m" src="/avatar.jpg" />
```

## Status Badge Mapping

| Status | Badge Variant | Background |
|--------|---------------|------------|
| draft | neutral | neutral-alpha-weak |
| ready | brand | brand-alpha-weak |
| waiting | warning | warning-alpha-weak |
| done | success | success-alpha-weak |
| late | danger | danger-alpha-weak |

## Responsive Breakpoints

Once UI uses semantic breakpoints:
- `xs`: < 480px
- `s`: 480px - 768px  
- `m`: 768px - 1024px
- `l`: 1024px - 1280px
- `xl`: > 1280px

```tsx
<Row s={{ direction: "column" }} gap="16">
  {/* Mobile: column, Desktop: row */}
</Row>
```

## Providers Setup

Wrap your app with Once UI providers:

```tsx
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, DataThemeProvider, IconProvider, ToastProvider } from "@once-ui-system/core";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme="system" brand="blue" accent="indigo" neutral="gray">
        <DataThemeProvider>
          <ToastProvider>
            <IconProvider>
              {children}
            </IconProvider>
          </ToastProvider>
        </DataThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

## Root Layout

```tsx
// app/layout.tsx
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import { Providers } from "./providers";
import { Layout } from "./layout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
```
