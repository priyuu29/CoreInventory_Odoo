import mongoose, { Schema, type Document } from "mongoose";

export type DeliveryStatus = "draft" | "waiting" | "ready" | "done";

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
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    responsible: { type: String },
    contact: { type: String },
    schedule_date: { type: Date },
    status: { type: String, enum: ["draft", "waiting", "ready", "done"], default: "draft" },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    validated_by: { type: Schema.Types.ObjectId, ref: "User" },
    validated_at: { type: Date },
    completed_at: { type: Date },
  },
  { timestamps: true },
);

DeliverySchema.index({ reference: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ warehouse: 1 });

export const Delivery =
  mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);
