import connectDB from "@/lib/db";
import { Location, Product, StockMove, User, Warehouse } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const product_id = searchParams.get("product_id");
    const move_type = searchParams.get("move_type");
    const warehouse_id = searchParams.get("warehouse_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    const query: any = {};

    if (product_id) {
      query.product = product_id;
    }
    if (move_type && move_type !== "all") {
      query.move_type = move_type;
    }
    if (warehouse_id && warehouse_id !== "all") {
      query.$or = [{ from_warehouse: warehouse_id }, { to_warehouse: warehouse_id }];
    }
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) {
        query.createdAt.$gte = new Date(date_from);
      }
      if (date_to) {
        query.createdAt.$lte = new Date(date_to);
      }
    }

    const skip = (page - 1) * limit;
    const [moves, total] = await Promise.all([
      StockMove.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("product", "name sku")
        .populate("from_warehouse", "name")
        .populate("from_location", "name")
        .populate("to_warehouse", "name")
        .populate("to_location", "name")
        .populate("created_by", "name"),
      StockMove.countDocuments(query),
    ]);

    return NextResponse.json({
      data: moves.map((m: any) => ({
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
        created_by: m.created_by
          ? {
              id: m.created_by._id,
              name: m.created_by.name,
            }
          : null,
        created_at: m.createdAt,
      })),
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching moves:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
