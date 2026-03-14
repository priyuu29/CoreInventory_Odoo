import connectDB from "@/lib/db";
import { Receipt, ReceiptItem, Stock } from "@/lib/models";
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

    if (receipt.status !== "draft") {
      return NextResponse.json({ error: "Only draft receipts can be validated" }, { status: 400 });
    }

    const items = await ReceiptItem.find({ receipt: id });
    if (items.length === 0) {
      return NextResponse.json({ error: "Receipt must have at least one item" }, { status: 400 });
    }

    const validatedAt = new Date();
    const updated = await Receipt.findByIdAndUpdate(
      id,
      {
        status: "ready",
        validated_by: user.id,
        validated_at: validatedAt,
      },
      { new: true },
    ).populate("validated_by", "name");

    const rec = updated as unknown as {
      _id: unknown;
      status: string;
      validated_by?: { _id: unknown; name: string };
    };

    return NextResponse.json({
      id: rec._id,
      status: rec.status,
      validated_by: rec.validated_by
        ? {
            id: rec.validated_by._id,
            name: rec.validated_by.name,
          }
        : null,
      validated_at: validatedAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
