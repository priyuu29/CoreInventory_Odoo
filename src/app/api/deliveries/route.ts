import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Location, Stock, User, Warehouse } from "@/lib/models";
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
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const warehouse_id = searchParams.get("warehouse_id");
    const search = searchParams.get("search");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (warehouse_id) {
      query.warehouse = warehouse_id;
    }
    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ];
    }
    if (date_from || date_to) {
      query.createdAt = {};
      if (date_from) {
        query.createdAt.$gte = new Date(date_from);
      }
      if (date_to) {
        query.createdAt.$lte = new Date(date_to);
      }
    }

    const skip = (page - 1) * limit;
    const total = await Delivery.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const deliveries = await Delivery.find(query)
      .populate("warehouse", "name")
      .populate("created_by", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const data = deliveries.map((d: any) => ({
      id: d._id,
      reference: d.reference,
      destination: d.destination,
      warehouse: d.warehouse?.name,
      contact: d.contact,
      schedule_date: d.schedule_date,
      status: d.status,
      created_at: d.createdAt,
    }));

    return NextResponse.json({
      data,
      meta: {
        current_page: page,
        total_pages: totalPages,
        total,
      },
    });
  } catch (error) {
    console.error(error);
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
    const { destination, warehouse_id, location_id, responsible, contact, schedule_date, notes } =
      body;

    if (!warehouse_id) {
      return NextResponse.json({ error: "Warehouse is required" }, { status: 400 });
    }

    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) {
      return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
    }

    if (location_id) {
      const location = await Location.findById(location_id);
      if (!location) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 });
      }
      if (location.warehouse.toString() !== warehouse_id) {
        return NextResponse.json(
          { error: "Location does not belong to the specified warehouse" },
          { status: 400 },
        );
      }
    }

    const count = await Delivery.countDocuments();
    const reference = `WH/OUT/${String(count + 1).padStart(4, "0")}`;

    const delivery = await Delivery.create({
      reference,
      destination,
      warehouse: warehouse_id,
      location: location_id,
      responsible,
      contact,
      schedule_date: schedule_date ? new Date(schedule_date) : undefined,
      status: "draft",
      notes,
      created_by: user.id,
    });

    return NextResponse.json(
      {
        id: delivery._id,
        reference: delivery.reference,
        destination: delivery.destination,
        warehouse_id: delivery.warehouse,
        status: delivery.status,
        created_at: delivery.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
