import connectDB from "@/lib/db";
import { Location, Product, Stock, Warehouse } from "@/lib/models";
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
    const warehouse_id = searchParams.get("warehouse_id");
    const location_id = searchParams.get("location_id");
    const search = searchParams.get("search") || "";
    const low_stock = searchParams.get("low_stock") === "true";

    const query: any = {};

    if (warehouse_id) {
      query.warehouse = warehouse_id;
    }
    if (location_id) {
      query.location = location_id;
    }

    let productQuery = {};
    if (search) {
      productQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ],
      };
    }
    if (low_stock) {
      productQuery = { ...productQuery, min_stock: { $gt: 0 } };
    }

    const products = await Product.find(productQuery).select("_id");
    const productIds = products.map((p: any) => p._id);

    if (productIds.length > 0) {
      query.product = { $in: productIds };
    } else if (search || low_stock) {
      return NextResponse.json({ data: [], meta: { current_page: 1, total_pages: 0, total: 0 } });
    }

    const skip = (page - 1) * limit;
    const [stocks, total] = await Promise.all([
      Stock.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("product", "name sku unit_cost unit min_stock")
        .populate("warehouse", "name")
        .populate("location", "name"),
      Stock.countDocuments(query),
    ]);

    let stockData = stocks.map((s: any) => ({
      id: s._id,
      product: s.product
        ? {
            id: s.product._id,
            name: s.product.name,
            sku: s.product.sku,
            unit_cost: s.product.unit_cost,
            unit: s.product.unit,
            min_stock: s.product.min_stock || null,
          }
        : null,
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

    if (low_stock) {
      stockData = stockData.filter(
        (s: any) => s.product?.min_stock && s.on_hand <= s.product.min_stock,
      );
    }

    return NextResponse.json({
      data: stockData,
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
