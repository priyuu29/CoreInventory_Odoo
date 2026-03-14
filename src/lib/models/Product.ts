import mongoose, { Schema, type Document } from "mongoose";

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
    unit: { type: String, default: "piece" },
    category: { type: String },
    image_url: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ name: "text", sku: "text" });

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
