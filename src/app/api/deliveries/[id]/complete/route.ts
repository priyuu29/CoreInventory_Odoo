import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Stock } from "@/lib/models";
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

    if (delivery.status !== "ready") {
      return NextResponse.json(
        { error: "Only ready deliveries can be completed" },
        { status: 400 },
      );
    }

    const items = await DeliveryItem.find({ delivery: id });

    for (const item of items) {
      const stock = await Stock.findOne({
        product: item.product,
        warehouse: delivery.warehouse,
      });

      if (stock) {
        await Stock.findOneAndUpdate(
          { product: item.product, warehouse: delivery.warehouse },
          {
            $inc: {
              on_hand: -item.quantity,
              reserved: -item.quantity,
            },
          },
        );
      }
    }

    const completedAt = new Date();
    const updated = await Delivery.findByIdAndUpdate(
      id,
      {
        status: "done",
        completed_at: completedAt,
      },
      { new: true },
    );

    return NextResponse.json({
      id: updated?._id,
      status: updated?.status,
      completed_at: completedAt,
      stock_updated: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
