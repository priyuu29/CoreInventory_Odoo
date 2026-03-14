import mongoose, { Schema, type Document } from "mongoose";

export type MoveType = "receipt" | "delivery" | "adjustment";

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
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    move_type: { type: String, enum: ["receipt", "delivery", "adjustment"], required: true },
    from_warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    from_location: { type: Schema.Types.ObjectId, ref: "Location" },
    to_warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    to_location: { type: Schema.Types.ObjectId, ref: "Location" },
    operation_id: { type: Schema.Types.ObjectId },
    operation_type: { type: String },
    reference: { type: String },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

StockMoveSchema.index({ product: 1 });
StockMoveSchema.index({ move_type: 1 });
StockMoveSchema.index({ createdAt: -1 });

export const StockMove =
  mongoose.models.StockMove || mongoose.model<IStockMove>("StockMove", StockMoveSchema);
