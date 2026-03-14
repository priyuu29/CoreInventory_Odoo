import mongoose, { Schema, type Document } from "mongoose";

export type ReceiptStatus = "draft" | "ready" | "done";

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
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    responsible: { type: String },
    contact: { type: String },
    schedule_date: { type: Date },
    status: { type: String, enum: ["draft", "ready", "done"], default: "draft" },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    validated_by: { type: Schema.Types.ObjectId, ref: "User" },
    validated_at: { type: Date },
    completed_at: { type: Date },
  },
  { timestamps: true },
);

ReceiptSchema.index({ status: 1 });
ReceiptSchema.index({ warehouse: 1 });
ReceiptSchema.index({ schedule_date: 1 });

export const Receipt =
  mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);
