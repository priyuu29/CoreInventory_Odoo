import connectDB from "@/lib/db";
import { Delivery, Location, Receipt, Stock, Warehouse } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const warehouseId = new Types.ObjectId(id);

    const stocks = await Stock.aggregate([
      { $match: { warehouse: warehouseId } },
      {
        $group: {
          _id: "$product",
          totalOnHand: { $sum: "$on_hand" },
          totalReserved: { $sum: "$reserved" },
        },
      },
    ]);

    const totalProducts = stocks.length;
    const totalStockValue = stocks.reduce((sum, s) => sum + s.totalOnHand * 0, 0);
    const locationsCount = await Location.countDocuments({ warehouse: warehouseId });
    const pendingReceipts = await Receipt.countDocuments({
      warehouse: warehouseId,
      status: { $in: ["draft", "ready"] },
    });
    const pendingDeliveries = await Delivery.countDocuments({
      warehouse: warehouseId,
      status: { $in: ["draft", "waiting", "ready"] },
    });

    return NextResponse.json({
      total_products: totalProducts,
      total_stock_value: totalStockValue,
      locations_count: locationsCount,
      pending_receipts: pendingReceipts,
      pending_deliveries: pendingDeliveries,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
