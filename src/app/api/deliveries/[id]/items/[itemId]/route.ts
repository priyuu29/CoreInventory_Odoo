import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Product, Stock } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import mongoose from "mongoose";
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

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    if (delivery.status === "done") {
      return NextResponse.json(
        { error: "Cannot update items in a completed delivery" },
        { status: 400 },
      );
    }

    const item = await DeliveryItem.findById(itemId);
    if (!item || item.delivery.toString() !== id) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updatedItem = await DeliveryItem.findByIdAndUpdate(itemId, updateData, {
      new: true,
    }).populate("product", "name sku");

    return NextResponse.json({
      id: updatedItem?._id,
      product: {
        id: (updatedItem as any)?.product?._id,
        name: (updatedItem as any)?.product?.name,
        sku: (updatedItem as any)?.product?.sku,
      },
      quantity: updatedItem?.quantity,
      notes: updatedItem?.notes,
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

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    if (delivery.status === "done") {
      return NextResponse.json(
        { error: "Cannot delete items from a completed delivery" },
        { status: 400 },
      );
    }

    const item = await DeliveryItem.findById(itemId);
    if (!item || item.delivery.toString() !== id) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await DeliveryItem.findByIdAndDelete(itemId);

    const remainingItems = await DeliveryItem.countDocuments({ delivery: id });
    if (remainingItems === 0 && delivery.status === "waiting") {
      await Delivery.findByIdAndUpdate(id, { status: "draft" });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
