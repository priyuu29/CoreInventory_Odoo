import mongoose, { Schema, type Document } from "mongoose";

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
    receipt: { type: Schema.Types.ObjectId, ref: "Receipt", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    unit_cost: { type: Number },
    notes: { type: String },
  },
  { timestamps: true },
);

export const ReceiptItem =
  mongoose.models.ReceiptItem || mongoose.model<IReceiptItem>("ReceiptItem", ReceiptItemSchema);
