import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Location, Stock, User, Warehouse } from "@/lib/models";
import { getAuthUser } from "@/lib/utils";
import mongoose from "mongoose";
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid delivery ID" }, { status: 400 });
    }

    const delivery = await Delivery.findById(id)
      .populate("warehouse", "name")
      .populate("location", "name")
      .populate("created_by", "name")
      .populate("validated_by", "name");

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const items = await DeliveryItem.find({ delivery: id }).populate("product", "name sku");

    const itemsWithStock = await Promise.all(
      items.map(async (item: any) => {
        const stock = await Stock.findOne({
          product: item.product._id,
          warehouse: (delivery as any).warehouse._id,
        });
        const availableStock = stock ? stock.on_hand - stock.reserved : 0;
        return {
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            sku: item.product.sku,
          },
          quantity: item.quantity,
          available_stock: availableStock,
          is_available: availableStock >= item.quantity,
          notes: item.notes,
        };
      }),
    );

    return NextResponse.json({
      id: delivery._id,
      reference: delivery.reference,
      destination: delivery.destination,
      warehouse: {
        id: (delivery as any).warehouse._id,
        name: (delivery as any).warehouse.name,
      },
      location: (delivery as any).location
        ? {
            id: (delivery as any).location._id,
            name: (delivery as any).location.name,
          }
        : null,
      responsible: delivery.responsible,
      contact: delivery.contact,
      schedule_date: delivery.schedule_date,
      status: delivery.status,
      notes: delivery.notes,
      items: itemsWithStock,
      created_by: {
        id: (delivery as any).created_by._id,
        name: (delivery as any).created_by.name,
      },
      validated_by: (delivery as any).validated_by
        ? {
            id: (delivery as any).validated_by._id,
            name: (delivery as any).validated_by.name,
          }
        : null,
      created_at: delivery.createdAt,
    });
  } catch (error) {
    console.error(error);
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

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    if (delivery.status !== "draft" && delivery.status !== "waiting") {
      return NextResponse.json(
        { error: "Cannot update delivery that is already validated or completed" },
        { status: 400 },
      );
    }

    const updateData: any = {};
    if (body.destination !== undefined) updateData.destination = body.destination;
    if (body.warehouse_id !== undefined) {
      const warehouse = await Warehouse.findById(body.warehouse_id);
      if (!warehouse) {
        return NextResponse.json({ error: "Warehouse not found" }, { status: 404 });
      }
      updateData.warehouse = body.warehouse_id;
    }
    if (body.location_id !== undefined) {
      if (body.location_id) {
        const location = await Location.findById(body.location_id);
        if (!location) {
          return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }
      }
      updateData.location = body.location_id || null;
    }
    if (body.responsible !== undefined) updateData.responsible = body.responsible;
    if (body.contact !== undefined) updateData.contact = body.contact;
    if (body.schedule_date !== undefined) {
      updateData.schedule_date = body.schedule_date ? new Date(body.schedule_date) : null;
    }
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updated = await Delivery.findByIdAndUpdate(id, updateData, { new: true })
      .populate("warehouse", "name")
      .populate("location", "name");

    return NextResponse.json({
      id: updated?._id,
      reference: updated?.reference,
      destination: updated?.destination,
      warehouse: {
        id: (updated as any)?.warehouse?._id,
        name: (updated as any)?.warehouse?.name,
      },
      location: (updated as any)?.location
        ? {
            id: (updated as any)?.location?._id,
            name: (updated as any)?.location?.name,
          }
        : null,
      responsible: updated?.responsible,
      contact: updated?.contact,
      schedule_date: updated?.schedule_date,
      status: updated?.status,
      notes: updated?.notes,
      created_at: updated?.createdAt,
    });
  } catch (error) {
    console.error(error);
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

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    if (delivery.status !== "draft") {
      return NextResponse.json({ error: "Only draft deliveries can be deleted" }, { status: 400 });
    }

    await DeliveryItem.deleteMany({ delivery: id });
    await Delivery.findByIdAndDelete(id);

    return NextResponse.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
