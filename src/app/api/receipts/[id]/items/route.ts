import connectDB from "@/lib/db";
import { Product, Receipt, ReceiptItem } from "@/lib/models";
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
    const body = await request.json();
    const { product_id, quantity, unit_cost, notes } = body;

    if (!product_id || !quantity) {
      return NextResponse.json({ error: "Product and quantity are required" }, { status: 400 });
    }

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status === "done") {
      return NextResponse.json(
        { error: "Cannot add items to a completed receipt" },
        { status: 400 },
      );
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingItem = await ReceiptItem.findOne({
      receipt: id,
      product: product_id,
    });
    if (existingItem) {
      return NextResponse.json(
        { error: "Product already exists in this receipt. Use update to change quantity." },
        { status: 400 },
      );
    }

    const item = await ReceiptItem.create({
      receipt: id,
      product: product_id,
      quantity,
      unit_cost,
      notes,
    });

    const populatedItem = await ReceiptItem.findById(item._id).populate("product", "name sku");

    const it = populatedItem as unknown as {
      _id: unknown;
      product: { _id: unknown; name: string; sku: string };
      quantity: number;
      unit_cost?: number;
      notes?: string;
    };

    return NextResponse.json(
      {
        id: it._id,
        product: {
          id: it.product._id,
          name: it.product.name,
          sku: it.product.sku,
        },
        quantity: it.quantity,
        unit_cost: it.unit_cost,
        notes: it.notes,
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

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const items = await ReceiptItem.find({ receipt: id }).populate("product", "name sku");

    const itemsData = items.map((item: unknown) => {
      const it = item as {
        _id: unknown;
        product: { _id: unknown; name: string; sku: string };
        quantity: number;
        unit_cost?: number;
        notes?: string;
      };
      return {
        id: it._id,
        product: {
          id: it.product._id,
          name: it.product.name,
          sku: it.product.sku,
        },
        quantity: it.quantity,
        unit_cost: it.unit_cost,
        notes: it.notes,
      };
    });

    return NextResponse.json({ data: itemsData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
