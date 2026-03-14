import mongoose, { Schema, type Document } from "mongoose";
import type { ILocation } from "./Location";
import type { IProduct } from "./Product";
import type { IWarehouse } from "./Warehouse";

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
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    on_hand: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
  },
  { timestamps: true },
);

StockSchema.index({ product: 1, warehouse: 1, location: 1 }, { unique: true });

export const Stock = mongoose.models.Stock || mongoose.model<IStock>("Stock", StockSchema);
