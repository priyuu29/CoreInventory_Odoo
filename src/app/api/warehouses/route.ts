import connectDB from "@/lib/db";
import { Location, Stock, Warehouse } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });

    const warehousesWithCount = await Promise.all(
      warehouses.map(async (w) => {
        const locationsCount = await Location.countDocuments({ warehouse: w._id });
        return {
          id: w._id,
          name: w.name,
          short_code: w.short_code,
          address: w.address,
          is_active: w.is_active,
          locations_count: locationsCount,
          created_at: w.createdAt,
        };
      }),
    );

    return NextResponse.json({ data: warehousesWithCount });
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
    const { name, short_code, address } = body;

    if (!name || !short_code) {
      return NextResponse.json({ error: "Name and short code are required" }, { status: 400 });
    }

    const existingWarehouse = await Warehouse.findOne({ short_code: short_code.toUpperCase() });
    if (existingWarehouse) {
      return NextResponse.json({ error: "Short code already exists" }, { status: 422 });
    }

    const warehouse = await Warehouse.create({
      name,
      short_code: short_code.toUpperCase(),
      address,
      is_active: true,
    });

    return NextResponse.json(
      {
        id: warehouse._id,
        name: warehouse.name,
        short_code: warehouse.short_code,
        address: warehouse.address,
        is_active: warehouse.is_active,
        created_at: warehouse.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
