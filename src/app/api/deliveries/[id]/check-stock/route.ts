import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Product, Stock } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const items = await DeliveryItem.find({ delivery: id }).populate("product", "name");

    const stockCheckResults = await Promise.all(
      items.map(async (item: any) => {
        const stock = await Stock.findOne({
          product: item.product._id,
          warehouse: delivery.warehouse,
        });
        const available = stock ? stock.on_hand - stock.reserved : 0;
        return {
          item_id: item._id,
          product_id: item.product._id,
          product_name: item.product.name,
          requested: item.quantity,
          available: available,
          is_available: available >= item.quantity,
        };
      }),
    );

    const allAvailable = stockCheckResults.every((r) => r.is_available);

    return NextResponse.json({
      all_available: allAvailable,
      items: stockCheckResults,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
