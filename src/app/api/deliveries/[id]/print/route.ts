import connectDB from "@/lib/db";
import { Delivery, DeliveryItem, Warehouse } from "@/lib/models";
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

    const delivery = await Delivery.findById(id)
      .populate("warehouse", "name address")
      .populate("created_by", "name");

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const items = await DeliveryItem.find({ delivery: id }).populate("product", "name sku");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Delivery ${(delivery as any).reference}</title>
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
  <h1>Delivery Order</h1>
  <div class="header">
    <div>
      <strong>Reference:</strong> ${(delivery as any).reference}<br>
      <strong>Date:</strong> ${new Date((delivery as any).createdAt).toLocaleDateString()}
    </div>
    <div>
      <strong>Status:</strong> ${(delivery as any).status.toUpperCase()}
    </div>
  </div>
  
  <div class="info">
    <h3>Destination</h3>
    <p><strong>Name:</strong> ${(delivery as any).destination || "-"}</p>
    <p><strong>Contact:</strong> ${(delivery as any).contact || "-"}</p>
    <p><strong>Responsible:</strong> ${(delivery as any).responsible || "-"}</p>
  </div>
  
  <div class="info">
    <h3>Warehouse</h3>
    <p><strong>Name:</strong> ${(delivery as any).warehouse?.name || "-"}</p>
    <p><strong>Address:</strong> ${(delivery as any).warehouse?.address || "-"}</p>
  </div>
  
  <div class="info">
    <h3>Schedule Date</h3>
    <p>${(delivery as any).schedule_date ? new Date((delivery as any).schedule_date).toLocaleDateString() : "-"}</p>
  </div>
  
  <h3>Items</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>SKU</th>
        <th>Product</th>
        <th>Quantity</th>
      </tr>
    </thead>
    <tbody>
      ${(items as any[])
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.product?.sku || "-"}</td>
          <td>${item.product?.name || "-"}</td>
          <td>${item.quantity}</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
  
  ${(delivery as any).notes ? `<div class="info"><h3>Notes</h3><p>${(delivery as any).notes}</p></div>` : ""}
  
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
