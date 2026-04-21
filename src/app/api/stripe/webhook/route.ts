import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
    }
  } else {
    // Sem webhook secret (dev local sem Stripe CLI) — processar diretamente
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }
  }

  const supabase = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderId = pi.metadata?.order_id;

    if (orderId) {
      await supabase
        .from("orders")
        .update({
          payment_status: "pago",
          status: "confirmada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderId = pi.metadata?.order_id;

    if (orderId) {
      await supabase
        .from("orders")
        .update({
          payment_status: "falhado",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
