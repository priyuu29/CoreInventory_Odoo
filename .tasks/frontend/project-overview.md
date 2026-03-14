# CoreInventory - Project Overview

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod

## Folder Structure

```
coreinventory/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── receipts/
│   │   │   ├── receipts/[id]/
│   │   │   ├── deliveries/
│   │   │   ├── deliveries/[id]/
│   │   │   ├── stocks/
│   │   │   ├── warehouses/
│   │   │   ├── warehouses/[id]/
│   │   │   ├── locations/
│   │   │   ├── locations/[id]/
│   │   │   ├── moves/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── receipts/
│   │   │   ├── deliveries/
│   │   │   ├── stocks/
│   │   │   ├── warehouses/
│   │   │   ├── locations/
│   │   │   ├── products/
│   │   │   ├── moves/
│   │   │   └── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ui/              # ShadCN components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── shared/
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ActionButtons.tsx
│   │   └── forms/
│   ├── lib/
│   │   ├── db.ts           # MongoDB connection
│   │   ├── models/         # Mongoose models
│   │   ├── utils.ts
│   │   └── auth.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/coreinventory
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```
