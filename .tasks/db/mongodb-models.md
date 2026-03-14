# MongoDB Database Setup

## Connection
```typescript
// src/lib/db.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
```

## Models

### User Model
```typescript
// src/lib/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
```

### Warehouse Model
```typescript
// src/lib/models/Warehouse.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  short_code: string;
  address?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    short_code: { type: String, required: true, uppercase: true },
    address: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WarehouseSchema.index({ short_code: 1 }, { unique: true });

export const Warehouse = mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
```

### Location Model
```typescript
// src/lib/models/Location.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IWarehouse } from './Warehouse';

export interface ILocation extends Document {
  name: string;
  short_code: string;
  warehouse: mongoose.Types.ObjectId | IWarehouse;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true },
    short_code: { type: String, required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    description: { type: String },
  },
  { timestamps: true }
);

LocationSchema.index({ warehouse: 1, short_code: 1 }, { unique: true });

export const Location = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);
```

### Product Model
```typescript
// src/lib/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  unit_cost: number;
  unit: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, uppercase: true },
    description: { type: String },
    unit_cost: { type: Number, default: 0 },
    unit: { type: String, default: 'piece' },
    category: { type: String },
    image_url: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ name: 'text', sku: 'text' });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
```

### Stock Model
```typescript
// src/lib/models/Stock.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from './Product';
import { IWarehouse } from './Warehouse';
import { ILocation } from './Location';

export interface IStock extends Document {
  product: mongoose.Types.ObjectId | IProduct;
  warehouse: mongoose.Types.ObjectId | IWarehouse;
  location?: mongoose.Types.ObjectId | ILocation;
  on_hand: number;
  reserved: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema<IStock>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location' },
    on_hand: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StockSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });

export const Stock = mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);
```

### Receipt Model
```typescript
// src/lib/models/Receipt.ts
import mongoose, { Schema, Document } from 'mongoose';

export type ReceiptStatus = 'draft' | 'ready' | 'done';

export interface IReceipt extends Document {
  reference: string;
  vendor?: string;
  warehouse: mongoose.Types.ObjectId;
  location?: mongoose.Types.ObjectId;
  responsible?: string;
  contact?: string;
  schedule_date?: Date;
  status: ReceiptStatus;
  notes?: string;
  created_by: mongoose.Types.ObjectId;
  validated_by?: mongoose.Types.ObjectId;
  validated_at?: Date;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    reference: { type: String, required: true, unique: true },
    vendor: { type: String },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location' },
    responsible: { type: String },
    contact: { type: String },
    schedule_date: { type: Date },
    status: { type: String, enum: ['draft', 'ready', 'done'], default: 'draft' },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    validated_at: { type: Date },
    completed_at: { type: Date },
  },
  { timestamps: true }
);

ReceiptSchema.index({ reference: 1 });
ReceiptSchema.index({ status: 1 });
ReceiptSchema.index({ warehouse: 1 });
ReceiptSchema.index({ schedule_date: 1 });

export const Receipt = mongoose.models.Receipt || mongoose.model<IReceipt>('Receipt', ReceiptSchema);
```

### ReceiptItem Model
```typescript
// src/lib/models/ReceiptItem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReceiptItem extends Document {
  receipt: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  unit_cost?: number;
  notes?: string;
  createdAt: Date;
}

const ReceiptItemSchema = new Schema<IReceiptItem>(
  {
    receipt: { type: Schema.Types.ObjectId, ref: 'Receipt', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unit_cost: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ReceiptItem = mongoose.models.ReceiptItem || mongoose.model<IReceiptItem>('ReceiptItem', ReceiptItemSchema);
```

### Delivery Model
```typescript
// src/lib/models/Delivery.ts
import mongoose, { Schema, Document } from 'mongoose';

export type DeliveryStatus = 'draft' | 'waiting' | 'ready' | 'done';

export interface IDelivery extends Document {
  reference: string;
  destination?: string;
  warehouse: mongoose.Types.ObjectId;
  location?: mongoose.Types.ObjectId;
  responsible?: string;
  contact?: string;
  schedule_date?: Date;
  status: DeliveryStatus;
  notes?: string;
  created_by: mongoose.Types.ObjectId;
  validated_by?: mongoose.Types.ObjectId;
  validated_at?: Date;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    reference: { type: String, required: true, unique: true },
    destination: { type: String },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location' },
    responsible: { type: String },
    contact: { type: String },
    schedule_date: { type: Date },
    status: { type: String, enum: ['draft', 'waiting', 'ready', 'done'], default: 'draft' },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    validated_by: { type: Schema.Types.ObjectId, ref: 'User' },
    validated_at: { type: Date },
    completed_at: { type: Date },
  },
  { timestamps: true }
);

DeliverySchema.index({ reference: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ warehouse: 1 });

export const Delivery = mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
```

### DeliveryItem Model
```typescript
// src/lib/models/DeliveryItem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryItem extends Document {
  delivery: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  notes?: string;
  createdAt: Date;
}

const DeliveryItemSchema = new Schema<IDeliveryItem>(
  {
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const DeliveryItem = mongoose.models.DeliveryItem || mongoose.model<IDeliveryItem>('DeliveryItem', DeliveryItemSchema);
```

### StockMove Model
```typescript
// src/lib/models/StockMove.ts
import mongoose, { Schema, Document } from 'mongoose';

export type MoveType = 'receipt' | 'delivery' | 'adjustment';

export interface IStockMove extends Document {
  product: mongoose.Types.ObjectId;
  quantity: number;
  move_type: MoveType;
  from_warehouse?: mongoose.Types.ObjectId;
  from_location?: mongoose.Types.ObjectId;
  to_warehouse?: mongoose.Types.ObjectId;
  to_location?: mongoose.Types.ObjectId;
  operation_id?: mongoose.Types.ObjectId;
  operation_type?: string;
  reference?: string;
  notes?: string;
  created_by?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockMoveSchema = new Schema<IStockMove>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    move_type: { type: String, enum: ['receipt', 'delivery', 'adjustment'], required: true },
    from_warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    from_location: { type: Schema.Types.ObjectId, ref: 'Location' },
    to_warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    to_location: { type: Schema.Types.ObjectId, ref: 'Location' },
    operation_id: { type: Schema.Types.ObjectId },
    operation_type: { type: String },
    reference: { type: String },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

StockMoveSchema.index({ product: 1 });
StockMoveSchema.index({ move_type: 1 });
StockMoveSchema.index({ createdAt: -1 });

export const StockMove = mongoose.models.StockMove || mongoose.model<IStockMove>('StockMove', StockMoveSchema);
```

## Models Index
```typescript
// src/lib/models/index.ts
export { User } from './User';
export { Warehouse } from './Warehouse';
export { Location } from './Location';
export { Product } from './Product';
export { Stock } from './Stock';
export { Receipt } from './Receipt';
export { ReceiptItem } from './ReceiptItem';
export { Delivery } from './Delivery';
export { DeliveryItem } from './DeliveryItem';
export { StockMove } from './StockMove';
```
