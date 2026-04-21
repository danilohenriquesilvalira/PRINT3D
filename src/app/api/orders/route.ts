import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    discount,
    total,
    paymentMethod,
    notes,
  } = body;

  if (!customerName || !customerEmail || !shippingAddress || !items?.length) {
    return NextResponse.json(
      { error: "Campos obrigatórios em falta" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone ?? null,
      shipping_address: shippingAddress,
      items,
      subtotal: Number(subtotal),
      discount: Number(discount ?? 0),
      shipping_cost: 0,
      total: Number(total),
      status: "pendente",
      payment_status: "pendente",
      payment_method: paymentMethod ?? "entrega",
      notes: notes ?? null,
    })
    .select("id, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notificação por email ao dono via Resend (ativa quando RESEND_API_KEY estiver configurada)
  const resendKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  if (resendKey && ownerEmail && data) {
    const itemsList = items
      .map((i: { name: string; quantity: number; price: number }) => `${i.name} x${i.quantity} — €${i.price * i.quantity}`)
      .join("\n");

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PRINT3D <noreply@print3d.pt>",
        to: ownerEmail,
        subject: `🛒 Nova Encomenda #${(data.id as string).slice(0, 8).toUpperCase()} — €${total}`,
        text: `Nova encomenda recebida!\n\nCliente: ${customerName}\nEmail: ${customerEmail}\nTelefone: ${customerPhone}\n\nItens:\n${itemsList}\n\nTotal: €${total}\nPagamento: ${paymentMethod}\n\nVer no Supabase: https://supabase.com/dashboard/project/wnhfflafqengtdtgonsd/editor`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ order: data }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "ID da encomenda em falta" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, tracking_code, carrier, created_at, items, total, shipping_address")
    .eq("id", orderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}
