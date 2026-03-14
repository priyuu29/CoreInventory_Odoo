import connectDB from "@/lib/db";
import { Location, Stock, Warehouse } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouse_id");

    const query: any = {};
    if (warehouseId) {
      query.warehouse = new Types.ObjectId(warehouseId);
    }

    const locations = await Location.find(query)
      .populate("warehouse", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      data: locations.map((l: any) => ({
        id: l._id,
        name: l.name,
        short_code: l.short_code,
        warehouse: {
          id: l.warehouse._id,
          name: l.warehouse.name,
        },
        description: l.description,
        created_at: l.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { name, short_code, warehouse_id, description } = body;

    if (!name || !short_code || !warehouse_id) {
      return NextResponse.json(
        { error: "Name, short code and warehouse ID are required" },
        { status: 400 },
      );
    }

    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const existingLocation = await Location.findOne({
      warehouse: warehouse_id,
      short_code: short_code.toUpperCase(),
    });
    if (existingLocation) {
      return NextResponse.json(
        { error: "Location short code already exists in this warehouse" },
        { status: 422 },
      );
    }

    const location = await Location.create({
      name,
      short_code: short_code.toUpperCase(),
      warehouse: warehouse_id,
      description,
    });

    return NextResponse.json(
      {
        id: location._id,
        name: location.name,
        short_code: location.short_code,
        warehouse_id: location.warehouse,
        description: location.description,
        created_at: location.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
