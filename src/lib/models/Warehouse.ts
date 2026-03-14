import mongoose, { Schema, type Document } from "mongoose";

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
  { timestamps: true },
);

WarehouseSchema.index({ short_code: 1 }, { unique: true });

export const Warehouse =
  mongoose.models.Warehouse || mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);
