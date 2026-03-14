import connectDB from "@/lib/db";
import { Product, Stock, StockMove, User } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { product_id, warehouse_id, location_id, quantity, reason, notes } = body;

    if (!product_id || !warehouse_id || quantity === undefined) {
      return NextResponse.json(
        { error: "product_id, warehouse_id, and quantity are required" },
        { status: 400 },
      );
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let stock = await Stock.findOne({
      product: product_id,
      warehouse: warehouse_id,
      location: location_id || null,
    });

    if (!stock) {
      stock = await Stock.create({
        product: product_id,
        warehouse: warehouse_id,
        location: location_id || null,
        on_hand: 0,
        reserved: 0,
      });
    }

    const previousOnHand = stock.on_hand;
    stock.on_hand += quantity;

    if (stock.on_hand < 0) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    await stock.save();

    const user = await User.findOne({ email: authUser.email });
    const move = await StockMove.create({
      product: product_id,
      quantity: Math.abs(quantity),
      move_type: quantity >= 0 ? "adjustment" : "adjustment",
      from_warehouse: quantity < 0 ? warehouse_id : null,
      from_location: quantity < 0 ? location_id : null,
      to_warehouse: quantity >= 0 ? warehouse_id : null,
      to_location: quantity >= 0 ? location_id : null,
      reference: `ADJ/${Date.now()}`,
      operation_type: "adjustment",
      notes:
        `${reason || "Stock adjustment"}: ${quantity >= 0 ? "+" : ""}${quantity}. ${notes || ""}`.trim(),
      created_by: user?._id,
    });

    return NextResponse.json(
      {
        id: move._id,
        stock: {
          id: stock._id,
          previous_on_hand: previousOnHand,
          current_on_hand: stock.on_hand,
          reserved: stock.reserved,
          free_to_use: stock.on_hand - stock.reserved,
        },
        move: {
          id: move._id,
          quantity: move.quantity,
          move_type: move.move_type,
          reference: move.reference,
          notes: move.notes,
          created_at: move.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
