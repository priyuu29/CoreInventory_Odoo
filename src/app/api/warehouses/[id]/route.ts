import connectDB from "@/lib/db";
import { Delivery, Location, Receipt, Stock, Warehouse } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
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
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    const locations = await Location.find({ warehouse: id });

    return NextResponse.json({
      id: warehouse._id,
      name: warehouse.name,
      short_code: warehouse.short_code,
      address: warehouse.address,
      is_active: warehouse.is_active,
      locations: locations.map((l) => ({
        id: l._id,
        name: l.name,
        short_code: l.short_code,
      })),
      created_at: warehouse.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const warehouse = await Warehouse.findByIdAndUpdate(id, body, { new: true });
    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: warehouse._id,
      name: warehouse.name,
      short_code: warehouse.short_code,
      address: warehouse.address,
      is_active: warehouse.is_active,
      created_at: warehouse.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const stocks = await Stock.find({ warehouse: id });
    if (stocks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete warehouse with existing stock" },
        { status: 400 },
      );
    }

    const warehouse = await Warehouse.findByIdAndDelete(id);
    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
