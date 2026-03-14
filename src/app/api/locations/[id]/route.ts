import connectDB from "@/lib/db";
import { Location, Stock, Warehouse } from "@/lib/models";
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
    const location = await Location.findById(id).populate("warehouse", "name");
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const stocks = await Stock.find({ location: id }).populate("product", "name sku");

    return NextResponse.json({
      id: location._id,
      name: location.name,
      short_code: location.short_code,
      warehouse: {
        id: (location as any).warehouse._id,
        name: (location as any).warehouse.name,
      },
      description: location.description,
      stocks: stocks.map((s: any) => ({
        product: {
          id: s.product._id,
          name: s.product.name,
        },
        on_hand: s.on_hand,
      })),
      created_at: location.createdAt,
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

    const location = await Location.findByIdAndUpdate(id, body, { new: true });
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: location._id,
      name: location.name,
      short_code: location.short_code,
      description: location.description,
      created_at: location.createdAt,
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

    const stocks = await Stock.find({ location: id });
    if (stocks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete location with existing stock" },
        { status: 400 },
      );
    }

    const location = await Location.findByIdAndDelete(id);
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Location deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
