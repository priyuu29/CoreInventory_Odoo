import connectDB from "@/lib/db";
import { Receipt, ReceiptItem } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, itemId } = await params;
    const body = await request.json();

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status === "done") {
      return NextResponse.json(
        { error: "Cannot update items in a completed receipt" },
        { status: 400 },
      );
    }

    const item = await ReceiptItem.findById(itemId);
    if (!item || item.receipt.toString() !== id) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.unit_cost !== undefined) updateData.unit_cost = body.unit_cost;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updatedItem = await ReceiptItem.findByIdAndUpdate(itemId, updateData, {
      new: true,
    }).populate("product", "name sku");

    const it = updatedItem as unknown as {
      _id: unknown;
      product: { _id: unknown; name: string; sku: string };
      quantity: number;
      unit_cost?: number;
      notes?: string;
    };

    return NextResponse.json({
      id: it._id,
      product: {
        id: it.product._id,
        name: it.product.name,
        sku: it.product.sku,
      },
      quantity: it.quantity,
      unit_cost: it.unit_cost,
      notes: it.notes,
    });
  } catch (error) {
    console.error(error);
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
    const { id, itemId } = await params;

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status === "done") {
      return NextResponse.json(
        { error: "Cannot delete items from a completed receipt" },
        { status: 400 },
      );
    }

    const item = await ReceiptItem.findById(itemId);
    if (!item || item.receipt.toString() !== id) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await ReceiptItem.findByIdAndDelete(itemId);

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
