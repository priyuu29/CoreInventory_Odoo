import connectDB from "@/lib/db";
import { Receipt, ReceiptItem } from "@/lib/models";
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

    const receipt = await Receipt.findById(id)
      .populate("warehouse", "name address")
      .populate("created_by", "name");

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const items = await ReceiptItem.find({ receipt: id }).populate("product", "name sku");

    const rec = receipt as unknown as {
      reference: string;
      vendor?: string;
      warehouse?: { name: string; address?: string };
      responsible?: string;
      contact?: string;
      schedule_date?: Date;
      status: string;
      notes?: string;
      createdAt: Date;
    };

    const itemsList = items as unknown as {
      product?: { sku?: string; name?: string };
      quantity: number;
      unit_cost?: number;
    }[];

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${rec.reference}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info { margin-bottom: 20px; }
    .info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; }
    .footer { margin-top: 30px; display: flex; justify-content: space-between; }
    .signature { width: 200px; text-align: center; border-top: 1px solid #333; padding-top: 10px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Receipt Order</h1>
  <div class="header">
    <div>
      <strong>Reference:</strong> ${rec.reference}<br>
      <strong>Date:</strong> ${new Date(rec.createdAt).toLocaleDateString()}
    </div>
    <div>
      <strong>Status:</strong> ${rec.status.toUpperCase()}
    </div>
  </div>
  
  <div class="info">
    <h3>Vendor</h3>
    <p><strong>Name:</strong> ${rec.vendor || "-"}</p>
    <p><strong>Contact:</strong> ${rec.contact || "-"}</p>
    <p><strong>Responsible:</strong> ${rec.responsible || "-"}</p>
  </div>
  
  <div class="info">
    <h3>Warehouse</h3>
    <p><strong>Name:</strong> ${rec.warehouse?.name || "-"}</p>
    <p><strong>Address:</strong> ${rec.warehouse?.address || "-"}</p>
  </div>
  
  <div class="info">
    <h3>Schedule Date</h3>
    <p>${rec.schedule_date ? new Date(rec.schedule_date).toLocaleDateString() : "-"}</p>
  </div>
  
  <h3>Items</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>SKU</th>
        <th>Product</th>
        <th>Quantity</th>
        <th>Unit Cost</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsList
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.product?.sku || "-"}</td>
          <td>${item.product?.name || "-"}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_cost ? "$" + item.unit_cost.toFixed(2) : "-"}</td>
          <td>${item.unit_cost ? "$" + (item.quantity * item.unit_cost).toFixed(2) : "-"}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
  
  ${rec.notes ? `<div class="info"><h3>Notes</h3><p>${rec.notes}</p></div>` : ""}
  
  <div class="footer">
    <div class="signature">Prepared By</div>
    <div class="signature">Approved By</div>
    <div class="signature">Received By</div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
