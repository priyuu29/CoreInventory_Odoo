import mongoose, { Schema, type Document } from "mongoose";

export interface IDeliveryItem extends Document {
  delivery: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  notes?: string;
  createdAt: Date;
}

const DeliveryItemSchema = new Schema<IDeliveryItem>(
  {
    delivery: { type: Schema.Types.ObjectId, ref: "Delivery", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

export const DeliveryItem =
  mongoose.models.DeliveryItem || mongoose.model<IDeliveryItem>("DeliveryItem", DeliveryItemSchema);
