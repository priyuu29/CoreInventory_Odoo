import connectDB from "@/lib/db";
import { Location, Receipt, ReceiptItem, Stock, Warehouse } from "@/lib/models";
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
      return NextResponse.json({ error: "Invalid receipt ID" }, { status: 400 });
    }

    const receipt = await Receipt.findById(id)
      .populate("warehouse", "name")
      .populate("location", "name")
      .populate("created_by", "name")
      .populate("validated_by", "name");

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const items = await ReceiptItem.find({ receipt: id }).populate("product", "name sku");

    const itemsData = items.map((item: unknown) => {
      const it = item as {
        _id: unknown;
        product: { _id: unknown; name: string; sku: string };
        quantity: number;
        unit_cost?: number;
        notes?: string;
      };
      return {
        id: it._id,
        product: {
          id: it.product._id,
          name: it.product.name,
          sku: it.product.sku,
        },
        quantity: it.quantity,
        unit_cost: it.unit_cost,
        notes: it.notes,
      };
    });

    const rec = receipt as unknown as {
      _id: unknown;
      reference: string;
      vendor?: string;
      warehouse: { _id: unknown; name: string };
      location?: { _id: unknown; name: string };
      responsible?: string;
      contact?: string;
      schedule_date?: Date;
      status: string;
      notes?: string;
      created_by: { _id: unknown; name: string };
      validated_by?: { _id: unknown; name: string };
      createdAt: Date;
    };

    return NextResponse.json({
      id: rec._id,
      reference: rec.reference,
      vendor: rec.vendor,
      warehouse: {
        id: rec.warehouse._id,
        name: rec.warehouse.name,
      },
      location: rec.location
        ? {
            id: rec.location._id,
            name: rec.location.name,
          }
        : null,
      responsible: rec.responsible,
      contact: rec.contact,
      schedule_date: rec.schedule_date,
      status: rec.status,
      notes: rec.notes,
      items: itemsData,
      created_by: {
        id: rec.created_by._id,
        name: rec.created_by.name,
      },
      validated_by: rec.validated_by
        ? {
            id: rec.validated_by._id,
            name: rec.validated_by.name,
          }
        : null,
      created_at: rec.createdAt,
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

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status !== "draft") {
      return NextResponse.json(
        { error: "Cannot update receipt that is already validated or completed" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.vendor !== undefined) updateData.vendor = body.vendor;
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

    const updated = await Receipt.findByIdAndUpdate(id, updateData, { new: true })
      .populate("warehouse", "name")
      .populate("location", "name");

    const rec = updated as unknown as {
      _id: unknown;
      reference: string;
      vendor?: string;
      warehouse?: { _id: unknown; name: string };
      location?: { _id: unknown; name: string };
      responsible?: string;
      contact?: string;
      schedule_date?: Date;
      status: string;
      notes?: string;
      createdAt: Date;
    };

    return NextResponse.json({
      id: rec._id,
      reference: rec.reference,
      vendor: rec.vendor,
      warehouse: {
        id: rec.warehouse?._id,
        name: rec.warehouse?.name,
      },
      location: rec.location
        ? {
            id: rec.location?._id,
            name: rec.location?.name,
          }
        : null,
      responsible: rec.responsible,
      contact: rec.contact,
      schedule_date: rec.schedule_date,
      status: rec.status,
      notes: rec.notes,
      created_at: rec.createdAt,
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

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status !== "draft") {
      return NextResponse.json({ error: "Only draft receipts can be deleted" }, { status: 400 });
    }

    await ReceiptItem.deleteMany({ receipt: id });
    await Receipt.findByIdAndDelete(id);

    return NextResponse.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
