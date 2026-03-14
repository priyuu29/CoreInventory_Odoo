import connectDB from "@/lib/db";
import { Product, Stock } from "@/lib/models";
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
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stocks = await Stock.find({ product: id }).populate("warehouse", "name");
    const stocksData = stocks.map((s: any) => ({
      warehouse: {
        id: s.warehouse._id,
        name: s.warehouse.name,
      },
      on_hand: s.on_hand,
      free_to_use: s.on_hand - s.reserved,
    }));

    const totalOnHand = stocks.reduce((sum: number, s: any) => sum + s.on_hand, 0);
    const totalReserved = stocks.reduce((sum: number, s: any) => sum + s.reserved, 0);

    return NextResponse.json({
      id: product._id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      unit_cost: product.unit_cost,
      unit: product.unit,
      category: product.category,
      image_url: product.image_url,
      is_active: product.is_active,
      stocks: stocksData,
      total_stock: {
        on_hand: totalOnHand,
        free_to_use: totalOnHand - totalReserved,
      },
      created_at: product.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: product._id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      unit_cost: product.unit_cost,
      unit: product.unit,
      category: product.category,
      image_url: product.image_url,
      is_active: product.is_active,
      created_at: product.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const stocks = await Stock.find({ product: id });
    if (stocks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing stock" },
        { status: 400 },
      );
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
