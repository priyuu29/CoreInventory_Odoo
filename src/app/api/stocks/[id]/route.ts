import connectDB from "@/lib/db";
import { Product, Stock, Warehouse } from "@/lib/models";
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
    const { id: productId } = await params;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stocks = await Stock.find({ product: productId })
      .populate("warehouse", "name")
      .populate("location", "name");

    const warehousesData = stocks.map((s: any) => ({
      warehouse: s.warehouse
        ? {
            id: s.warehouse._id,
            name: s.warehouse.name,
          }
        : null,
      location: s.location
        ? {
            id: s.location._id,
            name: s.location.name,
          }
        : null,
      on_hand: s.on_hand,
      reserved: s.reserved,
      free_to_use: s.on_hand - s.reserved,
    }));

    const totalOnHand = stocks.reduce((sum: number, s: any) => sum + s.on_hand, 0);
    const totalReserved = stocks.reduce((sum: number, s: any) => sum + s.reserved, 0);

    return NextResponse.json({
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
      },
      warehouses: warehousesData,
      total: {
        on_hand: totalOnHand,
        reserved: totalReserved,
        free_to_use: totalOnHand - totalReserved,
      },
    });
  } catch (error) {
    console.error("Error fetching product stock:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
