import connectDB from "@/lib/db";
import { Delivery, Receipt } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const [receipts, deliveries] = await Promise.all([
      Receipt.find({ status: "done" }).sort({ completed_at: -1 }).limit(limit).lean(),
      Delivery.find({ status: "done" }).sort({ completed_at: -1 }).limit(limit).lean(),
    ]);

    const operations = [
      ...receipts.map((r) => ({
        id: r._id,
        type: "receipt",
        reference: r.reference,
        status: r.status,
        created_at: r.completed_at || r.createdAt,
      })),
      ...deliveries.map((d) => ({
        id: d._id,
        type: "delivery",
        reference: d.reference,
        status: d.status,
        created_at: d.completed_at || d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return NextResponse.json({ operations });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
