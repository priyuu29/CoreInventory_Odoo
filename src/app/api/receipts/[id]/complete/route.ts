import connectDB from "@/lib/db";
import { Product, Receipt, ReceiptItem, Stock } from "@/lib/models";
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

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status !== "ready") {
      return NextResponse.json({ error: "Only ready receipts can be completed" }, { status: 400 });
    }

    const items = await ReceiptItem.find({ receipt: id });

    for (const item of items) {
      const stock = await Stock.findOne({
        product: item.product,
        warehouse: receipt.warehouse,
      });

      if (stock) {
        await Stock.findOneAndUpdate(
          { product: item.product, warehouse: receipt.warehouse },
          {
            $inc: {
              on_hand: item.quantity,
            },
          },
        );
      } else {
        await Stock.create({
          product: item.product,
          warehouse: receipt.warehouse,
          on_hand: item.quantity,
          reserved: 0,
        });
      }

      if (item.unit_cost) {
        await Product.findByIdAndUpdate(item.product, {
          unit_cost: item.unit_cost,
        });
      }
    }

    const completedAt = new Date();
    const updated = await Receipt.findByIdAndUpdate(
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
