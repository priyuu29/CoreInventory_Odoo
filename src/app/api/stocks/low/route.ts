import connectDB from "@/lib/db";
import { Product, Stock } from "@/lib/models";
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
    const warehouse_id = searchParams.get("warehouse_id");

    const productsWithMinStock = await Product.find({
      min_stock: { $exists: true, $gt: 0 },
    }).select("_id");
    const productIds = productsWithMinStock.map((p: any) => p._id);

    if (productIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const query: any = {
      product: { $in: productIds },
    };

    if (warehouse_id) {
      query.warehouse = warehouse_id;
    }

    const stocks = await Stock.find(query)
      .populate("product", "name sku min_stock")
      .populate("warehouse", "name");

    const lowStockData = stocks
      .filter((s: any) => s.product?.min_stock && s.on_hand <= s.product.min_stock)
      .map((s: any) => ({
        product: {
          id: s.product._id,
          name: s.product.name,
          sku: s.product.sku,
          min_stock: s.product.min_stock,
        },
        warehouse: s.warehouse
          ? {
              id: s.warehouse._id,
              name: s.warehouse.name,
            }
          : null,
        on_hand: s.on_hand,
        free_to_use: s.on_hand - s.reserved,
      }));

    return NextResponse.json({ data: lowStockData });
  } catch (error) {
    console.error("Error fetching low stock:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
