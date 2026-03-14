import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Product, Stock } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import mongoose from "mongoose";
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
    const body = await request.json();
    const { product_id, quantity, notes } = body;

    if (!product_id || !quantity) {
      return NextResponse.json({ error: "Product and quantity are required" }, { status: 400 });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    if (delivery.status === "done") {
      return NextResponse.json(
        { error: "Cannot add items to a completed delivery" },
        { status: 400 },
      );
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingItem = await DeliveryItem.findOne({
      delivery: id,
      product: product_id,
    });
    if (existingItem) {
      return NextResponse.json(
        { error: "Product already exists in this delivery. Use update to change quantity." },
        { status: 400 },
      );
    }

    const item = await DeliveryItem.create({
      delivery: id,
      product: product_id,
      quantity,
      notes,
    });

    if (delivery.status === "draft") {
      await Delivery.findByIdAndUpdate(id, { status: "waiting" });
    }

    const populatedItem = await DeliveryItem.findById(item._id).populate("product", "name sku");

    return NextResponse.json(
      {
        id: populatedItem?._id,
        product: {
          id: (populatedItem as any)?.product?._id,
          name: (populatedItem as any)?.product?.name,
          sku: (populatedItem as any)?.product?.sku,
        },
        quantity: populatedItem?.quantity,
        notes: populatedItem?.notes,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const items = await DeliveryItem.find({ delivery: id }).populate("product", "name sku");

    const itemsWithStock = await Promise.all(
      items.map(async (item: any) => {
        const stock = await Stock.findOne({
          product: item.product._id,
          warehouse: delivery.warehouse,
        });
        const availableStock = stock ? stock.on_hand - stock.reserved : 0;
        return {
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            sku: item.product.sku,
          },
          quantity: item.quantity,
          available_stock: availableStock,
          is_available: availableStock >= item.quantity,
          notes: item.notes,
        };
      }),
    );

    return NextResponse.json({ data: itemsWithStock });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
