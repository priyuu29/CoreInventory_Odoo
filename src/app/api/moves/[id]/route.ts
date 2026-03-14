import connectDB from "@/lib/db";
import { StockMove } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const move = await StockMove.findById(id)
      .populate("product", "name sku")
      .populate("from_warehouse", "name")
      .populate("from_location", "name")
      .populate("to_warehouse", "name")
      .populate("to_location", "name")
      .populate("created_by", "name");

    if (!move) {
      return NextResponse.json({ error: "Stock move not found" }, { status: 404 });
    }

    const m: any = move;

    return NextResponse.json({
      id: m._id,
      product: m.product
        ? {
            id: m.product._id,
            name: m.product.name,
            sku: m.product.sku,
          }
        : null,
      quantity: m.quantity,
      move_type: m.move_type,
      from_warehouse: m.from_warehouse
        ? {
            id: m.from_warehouse._id,
            name: m.from_warehouse.name,
          }
        : null,
      from_location: m.from_location
        ? {
            id: m.from_location._id,
            name: m.from_location.name,
          }
        : null,
      to_warehouse: m.to_warehouse
        ? {
            id: m.to_warehouse._id,
            name: m.to_warehouse.name,
          }
        : null,
      to_location: m.to_location
        ? {
            id: m.to_location._id,
            name: m.to_location.name,
          }
        : null,
      reference: m.reference,
      operation_type: m.operation_type,
      operation_id: m.operation_id,
      notes: m.notes,
      created_by: m.created_by
        ? {
            id: m.created_by._id,
            name: m.created_by.name,
          }
        : null,
      created_at: m.createdAt,
    });
  } catch (error) {
    console.error("Error fetching move:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
