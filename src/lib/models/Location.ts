import mongoose, { Schema, type Document } from "mongoose";
import type { IWarehouse } from "./Warehouse";

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
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    description: { type: String },
  },
  { timestamps: true },
);

LocationSchema.index({ warehouse: 1, short_code: 1 }, { unique: true });

export const Location =
  mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);
