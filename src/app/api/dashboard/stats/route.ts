import connectDB from "@/lib/db";
import { Delivery, Receipt } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("[DASHBOARD] Starting dashboard stats request");

  try {
    console.log("[DASHBOARD] Getting auth user...");
    const user = await getAuthUser(request);
    if (!user) {
      console.log("[DASHBOARD] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[DASHBOARD] User authenticated:", (user as any).id || (user as any)._id);

    console.log("[DASHBOARD] Connecting to database...");
    await connectDB();
    console.log("[DASHBOARD] Database connected successfully");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("[DASHBOARD] Today's date:", today);

    console.log("[DASHBOARD] Counting receipts with status 'ready'...");
    const receiptsPending = await Receipt.countDocuments({ status: "ready" });
    console.log("[DASHBOARD] Receipts pending:", receiptsPending);

    console.log("[DASHBOARD] Counting late receipts...");
    const receiptsLate = await Receipt.countDocuments({
      status: { $ne: "done" },
      schedule_date: { $lt: today },
    });
    console.log("[DASHBOARD] Receipts late:", receiptsLate);

    console.log("[DASHBOARD] Counting deliveries with status 'ready'...");
    const deliveriesPending = await Delivery.countDocuments({ status: "ready" });
    console.log("[DASHBOARD] Deliveries pending:", deliveriesPending);

    console.log("[DASHBOARD] Counting deliveries with status 'waiting'...");
    const deliveriesWaiting = await Delivery.countDocuments({ status: "waiting" });
    console.log("[DASHBOARD] Deliveries waiting:", deliveriesWaiting);

    console.log("[DASHBOARD] Fetching recent receipts...");
    const recentReceipts = await Receipt.find().sort({ createdAt: -1 }).limit(5).lean();
    console.log("[DASHBOARD] Recent receipts count:", recentReceipts.length);

    console.log("[DASHBOARD] Fetching recent deliveries...");
    const recentDeliveries = await Delivery.find().sort({ createdAt: -1 }).limit(5).lean();
    console.log("[DASHBOARD] Recent deliveries count:", recentDeliveries.length);

    console.log("[DASHBOARD] Returning response");
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
  } catch (error: any) {
    console.error("[DASHBOARD] Error occurred:", error);
    console.error("[DASHBOARD] Error message:", error.message);
    console.error("[DASHBOARD] Error name:", error.name);
    console.error("[DASHBOARD] Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
