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
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      data: products.map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        unit_cost: p.unit_cost,
        unit: p.unit,
        category: p.category,
        image_url: p.image_url,
        is_active: p.is_active,
        created_at: p.createdAt,
      })),
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { name, sku, description, unit_cost, unit, category, image_url } = body;

    if (!name || !sku) {
      return NextResponse.json({ error: "Name and SKU are required" }, { status: 400 });
    }

    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 422 });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      description,
      unit_cost: unit_cost || 0,
      unit: unit || "piece",
      category,
      image_url,
      is_active: true,
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
