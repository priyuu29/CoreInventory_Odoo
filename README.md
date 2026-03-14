# CoreInventory

A modern inventory management system built with Next.js, Once UI, MongoDB, and Mongoose.

![CoreInventory](public/images/og/home.jpg)

## Features

- **Dashboard** - Real-time overview of receipts, deliveries, and operations
- **Receipts** - Manage inventory receipts with list and kanban views
- **Deliveries** - Track deliveries with list and kanban views
- **Stock** - View current stock levels across warehouses
- **Warehouses** - Manage multiple warehouses
- **Locations** - Organize storage locations within warehouses
- **Moves** - Track all inventory movements (receipts, deliveries, adjustments)

## Tech Stack

- **Frontend**: Next.js 16, Once UI, React Query
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT-based auth

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/priyuu29/CoreInventory_Odoo.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/coreinventory
JWT_SECRET=your-secret-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/     # Dashboard
│   │   ├── receipts/     # Receipts
│   │   ├── deliveries/   # Deliveries
│   │   ├── stocks/       # Stock
│   │   ├── warehouses/   # Warehouses
│   │   ├── locations/    # Locations
│   │   └── moves/        # Move history
│   └── api/              # API routes
├── components/            # React components
├── lib/                  # Utilities and configs
│   ├── api/              # API client
│   ├── models/           # Mongoose models
│   └── db.ts            # Database connection
└── types/                # TypeScript types
```

## Deployment

### Vercel

Deploy to Vercel with MongoDB Atlas:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string
4. Deploy!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Receipts
- `GET /api/receipts` - List receipts
- `POST /api/receipts` - Create receipt
- `GET /api/receipts/[id]` - Get receipt details
- `PUT /api/receipts/[id]` - Update receipt
- `DELETE /api/receipts/[id]` - Delete receipt
- `POST /api/receipts/[id]/validate` - Validate receipt
- `POST /api/receipts/[id]/complete` - Complete receipt

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/[id]` - Get delivery details
- `PUT /api/deliveries/[id]` - Update delivery
- `DELETE /api/deliveries/[id]` - Delete delivery
- `POST /api/deliveries/[id]/validate` - Validate delivery
- `POST /api/deliveries/[id]/complete` - Complete delivery

### Stock
- `GET /api/stocks` - List stock levels
- `POST /api/stocks/adjust` - Adjust stock

### Warehouses
- `GET /api/warehouses` - List warehouses
- `POST /api/warehouses` - Create warehouse
- `GET /api/warehouses/[id]` - Get warehouse details
- `PUT /api/warehouses/[id]` - Update warehouse
- `DELETE /api/warehouses/[id]` - Delete warehouse
- `GET /api/warehouses/[id]/stats` - Get warehouse stats

### Locations
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `GET /api/locations/[id]` - Get location details
- `PUT /api/locations/[id]` - Update location
- `DELETE /api/locations/[id]` - Delete location

### Moves
- `GET /api/moves` - List movements
- `POST /api/moves` - Create movement

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/products/search` - Search products

## License

MIT License
