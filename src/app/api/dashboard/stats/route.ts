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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const receiptsPending = await Receipt.countDocuments({ status: "ready" });

    const receiptsLate = await Receipt.countDocuments({
      status: { $ne: "done" },
      schedule_date: { $lt: today },
    });

    const deliveriesPending = await Delivery.countDocuments({ status: "ready" });
    const deliveriesWaiting = await Delivery.countDocuments({ status: "waiting" });

    const recentReceipts = await Receipt.find().sort({ createdAt: -1 }).limit(5).lean();

    const recentDeliveries = await Delivery.find().sort({ createdAt: -1 }).limit(5).lean();

    return NextResponse.json({
      receipts_pending: receiptsPending,
      receipts_late: receiptsLate,
      deliveries_pending: deliveriesPending,
      deliveries_waiting: deliveriesWaiting,
      recent_receipts: recentReceipts.map((r) => ({
        id: r._id,
        reference: r.reference,
        vendor: r.vendor,
        status: r.status,
        schedule_date: r.schedule_date,
        createdAt: r.createdAt,
      })),
      recent_deliveries: recentDeliveries.map((d) => ({
        id: d._id,
        reference: d.reference,
        destination: d.destination,
        status: d.status,
        schedule_date: d.schedule_date,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
