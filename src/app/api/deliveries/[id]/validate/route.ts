import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Stock, User } from "@/lib/models";
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

    if (delivery.status !== "waiting") {
      return NextResponse.json(
        { error: "Only waiting deliveries can be validated" },
        { status: 400 },
      );
    }

    const items = await DeliveryItem.find({ delivery: id });

    for (const item of items) {
      const stock = await Stock.findOne({
        product: item.product,
        warehouse: delivery.warehouse,
      });

      if (!stock || stock.on_hand - stock.reserved < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product` }, { status: 400 });
      }
    }

    for (const item of items) {
      await Stock.findOneAndUpdate(
        { product: item.product, warehouse: delivery.warehouse },
        { $inc: { reserved: item.quantity } },
      );
    }

    const validatedAt = new Date();
    const updated = await Delivery.findByIdAndUpdate(
      id,
      {
        status: "ready",
        validated_by: user.id,
        validated_at: validatedAt,
      },
      { new: true },
    ).populate("validated_by", "name");

    return NextResponse.json({
      id: updated?._id,
      status: updated?.status,
      validated_by: {
        id: (updated as any)?.validated_by?._id,
        name: (updated as any)?.validated_by?.name,
      },
      validated_at: validatedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
