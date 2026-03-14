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
    const categories = await Product.distinct("category", { is_active: true });
    const filteredCategories = categories.filter((c: any) => c);

    return NextResponse.json({
      data: filteredCategories,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
