import connectDB from "@/lib/db";
import { Product } from "@/lib/models";
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
    const q = searchParams.get("q") || "";

    const products = await Product.find({
      $or: [{ name: { $regex: q, $options: "i" } }, { sku: { $regex: q, $options: "i" } }],
      is_active: true,
    }).limit(10);

    return NextResponse.json({
      data: products.map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        unit_cost: p.unit_cost,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
