"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FaLock, FaArrowRight, FaCircleCheck } from "react-icons/fa6";
import { MdOutlineErrorOutline } from "react-icons/md";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  attributes: string[];
  discount?: { amount: number; percentage: number } | number;
  srcUrl?: string;
};

type ShippingAddress = {
  street: string;
  doorNumber: string;
  floor?: string;
  city: string;
  postalCode: string;
  country: string;
  nif?: string | null;
};

type Props = {
  clientSecret: string;
  paymentIntentId: string;
  total: number;
  subtotal: number;
  discount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  notes?: string;
  onSuccess: (orderId: string) => void;
  onError: (msg: string) => void;
};

const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: "Cartão recusado. Verifica os dados ou tenta outro cartão.",
  insufficient_funds: "Saldo insuficiente no cartão.",
  incorrect_cvc: "Código de segurança (CVV) incorreto.",
  expired_card: "Cartão expirado. Tenta com um cartão válido.",
  incorrect_number: "Número do cartão inválido.",
  invalid_expiry_month: "Mês de validade inválido.",
  invalid_expiry_year: "Ano de validade inválido.",
  card_velocity_exceeded: "Demasiadas tentativas. Aguarda alguns minutos.",
  do_not_honor: "Transação recusada pelo banco. Contacta o teu banco.",
  fraudulent: "Transação bloqueada por segurança. Contacta o teu banco.",
  generic_decline: "Cartão recusado. Tenta outro cartão.",
};

function getErrorMessage(error: { code?: string; decline_code?: string; message?: string }): string {
  if (error.decline_code && STRIPE_ERROR_MESSAGES[error.decline_code]) {
    return STRIPE_ERROR_MESSAGES[error.decline_code];
  }
  if (error.code && STRIPE_ERROR_MESSAGES[error.code]) {
    return STRIPE_ERROR_MESSAGES[error.code];
  }
  return error.message ?? "Ocorreu um erro no pagamento. Tenta novamente.";
}

function PaymentForm({
  paymentIntentId,
  total,
  subtotal,
  discount,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  notes,
  onSuccess,
  onError,
}: Omit<Props, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    // Step 1: Validate card fields before submitting
    const { error: submitError } = await elements.submit();
    if (submitError) {
      const msg = getErrorMessage(submitError as { code?: string; decline_code?: string; message?: string });
      setMessage(msg);
      onError(msg);
      setLoading(false);
      return;
    }

    // Step 2: Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/sucesso/pendente`,
        payment_method_data: {
          billing_details: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      const msg = getErrorMessage(error as { code?: string; decline_code?: string; message?: string });
      setMessage(msg);
      onError(msg);
      setLoading(false);
      return;
    }

    if (paymentIntent?.status !== "succeeded") {
      const msg = "Pagamento não foi concluído. Tenta novamente.";
      setMessage(msg);
      onError(msg);
      setLoading(false);
      return;
    }

    // Step 3: Payment confirmed — NOW create the order
    try {
      const res = await fetch("/api/orders/from-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            attributes: item.attributes,
            discount: item.discount,
          })),
          subtotal,
          discount,
          total,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order?.id) {
        // Payment succeeded but order creation failed — don't block user
        console.error("Order creation failed after payment:", data.error);
        onSuccess("pendente");
        return;
      }

      onSuccess(data.order.id);
    } catch {
      // Payment succeeded — redirect anyway (webhook will handle order)
      onSuccess("pendente");
    } finally {
      setLoading(false);
    }
  }

  const isDev = process.env.NODE_ENV === "development";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card fields */}
      <div className="rounded-xl border border-black/10 overflow-hidden">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
              },
            },
            fields: {
              billingDetails: {
                name: "never",
                email: "never",
                phone: "never",
              },
            },
          }}
        />
      </div>

      {/* Error message */}
      {message && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <MdOutlineErrorOutline className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{message}</p>
        </div>
      )}

      {/* Total */}
      <div className="bg-[#F8F8F8] rounded-xl p-4 space-y-2">
        {discount > 0 && (
          <div className="flex justify-between text-sm text-black/60">
            <span>Desconto</span>
            <span className="text-red-500">-€{discount}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-black/60">Total a pagar</span>
          <span className="text-xl font-bold text-black">€{total}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || loading || !ready}
        className={cn(
          "w-full bg-black text-white rounded-full py-4 h-[56px] text-base font-semibold flex items-center justify-center gap-2 transition",
          "hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            A processar pagamento...
          </>
        ) : (
          <>
            <FaLock className="text-sm" />
            Pagar €{total} com segurança
            <FaArrowRight className="text-sm" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-black/30">
        <FaLock className="text-[10px]" />
        Pagamento 100% seguro via Stripe — dados encriptados SSL/TLS
      </div>

      {/* Test card info — dev only */}
      {isDev && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1.5">
          <p className="font-semibold flex items-center gap-1">
            <FaCircleCheck className="text-blue-500" /> Modo de teste Stripe
          </p>
          <div className="space-y-1">
            <p>✓ Cartão aprovado: <span className="font-mono font-bold">4242 4242 4242 4242</span></p>
            <p>✗ Cartão recusado: <span className="font-mono font-bold">4000 0000 0000 0002</span></p>
            <p>✗ Fundos insuf.: <span className="font-mono font-bold">4000 0000 0000 9995</span></p>
            <p className="text-blue-500">Validade: qualquer data futura | CVC: qualquer 3 dígitos</p>
          </div>
        </div>
      )}
    </form>
  );
}

export default function StripePayment(props: Props) {
  const { clientSecret, ...rest } = props;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#000000",
            colorBackground: "#ffffff",
            colorText: "#1a1a1a",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              padding: "12px 16px",
            },
            ".Input:focus": {
              border: "1px solid #000",
              boxShadow: "none",
            },
            ".Label": {
              fontSize: "13px",
              fontWeight: "500",
              color: "#666",
            },
            ".Error": {
              fontSize: "12px",
            },
          },
        },
        locale: "pt",
      }}
    >
      <PaymentForm {...rest} />
    </Elements>
  );
}
