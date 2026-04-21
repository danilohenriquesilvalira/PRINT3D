import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { orderId, paymentIntentId } = await request.json();

  if (!orderId || !paymentIntentId) {
    return NextResponse.json({ error: "Parâmetros em falta" }, { status: 400 });
  }

  // Verificar o estado do PaymentIntent no Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: "Pagamento ainda não confirmado" },
      { status: 400 }
    );
  }

  // Atualizar a encomenda no Supabase
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "pago",
      status: "confirmada",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
