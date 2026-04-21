import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    paymentIntentId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    discount,
    total,
    notes,
  } = body;

  if (!paymentIntentId || !customerName || !customerEmail || !shippingAddress || !items?.length) {
    return NextResponse.json({ error: "Campos obrigatórios em falta" }, { status: 400 });
  }

  // Verify payment actually succeeded on Stripe before creating any order
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return NextResponse.json({ error: "Erro ao verificar pagamento" }, { status: 400 });
  }

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: `Pagamento não confirmado (estado: ${paymentIntent.status})` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Check if order already exists for this paymentIntent (idempotency)
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ order: existing });
  }

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
      status: "confirmada",
      payment_status: "pago",
      payment_method: "cartao",
      payment_intent_id: paymentIntentId,
      notes: notes ?? null,
    })
    .select("id, status, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Email notification to owner
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
        subject: `✅ Nova Encomenda Paga #${(data.id as string).slice(0, 8).toUpperCase()} — €${total}`,
        text: `Nova encomenda confirmada e paga!\n\nCliente: ${customerName}\nEmail: ${customerEmail}\nTelefone: ${customerPhone}\n\nItens:\n${itemsList}\n\nTotal: €${total}\nPagamento: Cartão (Stripe)\nPaymentIntent: ${paymentIntentId}\n\nVer no Supabase: https://supabase.com/dashboard/project/wnhfflafqengtdtgonsd/editor`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ order: data }, { status: 201 });
}
