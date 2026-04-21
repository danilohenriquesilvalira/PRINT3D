import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { amount, customerEmail, customerName } = await request.json();

  if (!amount || amount < 0.5) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "eur",
    automatic_payment_methods: { enabled: true },
    metadata: {
      customer_email: customerEmail ?? "",
      customer_name: customerName ?? "",
    },
    receipt_email: customerEmail ?? undefined,
    description: "Encomenda PRINT3D",
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}
