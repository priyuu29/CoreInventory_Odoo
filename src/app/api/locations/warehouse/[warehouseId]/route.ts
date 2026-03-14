import connectDB from "@/lib/db";
import { Location } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ warehouseId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { warehouseId } = await params;

    const locations = await Location.find({ warehouse: new Types.ObjectId(warehouseId) });

    return NextResponse.json({
      data: locations.map((l) => ({
        id: l._id,
        name: l.name,
        short_code: l.short_code,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
