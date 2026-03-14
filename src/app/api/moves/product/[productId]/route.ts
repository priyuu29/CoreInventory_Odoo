import connectDB from "@/lib/db";
import { Product, Stock, StockMove } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { productId } = await params;

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const moves = await StockMove.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate("to_warehouse", "name")
      .populate("from_warehouse", "name");

    const totalIn = moves
      .filter((m: any) => m.move_type === "receipt")
      .reduce((sum: number, m: any) => sum + m.quantity, 0);

    const totalOut = moves
      .filter((m: any) => m.move_type === "delivery")
      .reduce((sum: number, m: any) => sum + m.quantity, 0);

    const stocks = await Stock.find({ product: productId });
    const currentStock = stocks.reduce((sum: number, s: any) => sum + s.on_hand, 0);

    const movesData = moves.map((m: any) => ({
      id: m._id,
      quantity: m.quantity,
      move_type: m.move_type,
      to_warehouse: m.to_warehouse?.name || null,
      from_warehouse: m.from_warehouse?.name || null,
      created_at: m.createdAt,
    }));

    return NextResponse.json({
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
      },
      moves: movesData,
      summary: {
        total_in: totalIn,
        total_out: totalOut,
        current_stock: currentStock,
      },
    });
  } catch (error) {
    console.error("Error fetching product moves:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
