import { createAdminClient } from "@/lib/supabase/admin";
import ClearCartOnSuccess from "@/components/checkout/ClearCartOnSuccess";
import { cn } from "@/lib/utils";
import { archivoBlack } from "@/styles/fonts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { MdOutlineLocalShipping, MdEmail } from "react-icons/md";

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  em_preparacao: "Em Preparação",
  enviada: "Enviada",
  entregue: "Entregue",
};

const STATUS_STEPS = ["pendente", "confirmada", "em_preparacao", "enviada", "entregue"];

function getDeliveryEstimate(): string {
  const today = new Date();
  const minDays = 3;
  const maxDays = 7;
  const min = new Date(today);
  const max = new Date(today);
  min.setDate(today.getDate() + minDays);
  max.setDate(today.getDate() + maxDays);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${min.toLocaleDateString("pt-PT", opts)} – ${max.toLocaleDateString("pt-PT", opts)}`;
}

export default async function SuccessPage({
  params,
}: {

  params: { orderId: string };
}) {
  const supabase = createAdminClient();

  // "pendente" is a fallback when order creation failed after payment succeeded
  if (params.orderId === "pendente") {
    return (
      <main className="pb-20 bg-[#F2F0F1] min-h-screen flex items-center justify-center">
        <ClearCartOnSuccess />
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className={cn(archivoBlack.className, "font-bold text-[28px] text-black uppercase")}>
            Pagamento Confirmado!
          </h1>
          <p className="text-black/60">O teu pagamento foi recebido com sucesso. A encomenda será processada em breve e receberás um email de confirmação.</p>
          <Link href="/perfil" className="inline-flex items-center gap-2 bg-black text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-black/80 transition">
            Ver Perfil <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </main>
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.orderId)
    .single();

  if (error || !order) notFound();

  const items = order.items as Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    attributes: string[];
  }>;

  const address = order.shipping_address as {
    street: string;
    doorNumber: string;
    floor?: string;
    city: string;
    postalCode: string;
    country: string;
  };

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <main className="pb-20 bg-[#F2F0F1] min-h-screen">
      <ClearCartOnSuccess />
      <div className="max-w-frame mx-auto px-4 xl:px-0 pt-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
          </div>
          <h1
            className={cn(
              archivoBlack.className,
              "font-bold text-[28px] md:text-[36px] text-black uppercase"
            )}
          >
            Encomenda Confirmada!
          </h1>
          <p className="text-black/60 mt-2">
            Obrigado, <strong>{order.customer_name}</strong>! A tua encomenda foi recebida.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-4 py-2 text-sm">
            <span className="text-black/50">Referência:</span>
            <span className="font-mono font-bold text-black">
              #{params.orderId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Status + Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status Progress */}
            <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
              <h2 className="font-bold text-base mb-5">Estado da Encomenda</h2>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-[2px] bg-black/10 z-0" />
                <div
                  className="absolute top-4 left-0 h-[2px] bg-black z-0 transition-all"
                  style={{
                    width:
                      currentStep <= 0
                        ? "0%"
                        : `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />
                {STATUS_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className="flex flex-col items-center gap-1 z-10 flex-1"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition",
                        i <= currentStep
                          ? "bg-black border-black text-white"
                          : "bg-white border-black/20 text-black/30"
                      )}
                    >
                      {i <= currentStep ? "✓" : i + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] text-center hidden sm:block",
                        i <= currentStep ? "text-black font-semibold" : "text-black/30"
                      )}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MdOutlineLocalShipping className="text-xl" />
                <h2 className="font-bold text-base">Informações de Entrega</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F8F8F8] rounded-xl p-4">
                  <p className="text-xs text-black/50 mb-1">Morada de Entrega</p>
                  <p className="text-sm font-medium">
                    {address.street}, {address.doorNumber}
                    {address.floor ? `, ${address.floor}` : ""}
                  </p>
                  <p className="text-sm text-black/70">
                    {address.postalCode} {address.city}
                  </p>
                  <p className="text-sm text-black/70">{address.country}</p>
                </div>
                <div className="bg-[#F8F8F8] rounded-xl p-4">
                  <p className="text-xs text-black/50 mb-1">Entrega Estimada</p>
                  <p className="text-sm font-medium">{getDeliveryEstimate()}</p>
                  <p className="text-xs text-black/50 mt-1">Envio gratuito</p>
                  {order.tracking_code && (
                    <div className="mt-2">
                      <p className="text-xs text-black/50">Código de Rastreio</p>
                      <p className="font-mono text-sm font-bold">{order.tracking_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MdEmail className="text-xl" />
                <h2 className="font-bold text-base">Confirmação por Email</h2>
              </div>
              <p className="text-sm text-black/60">
                Enviámos uma confirmação para{" "}
                <strong className="text-black">{order.customer_email}</strong>. Podes também
                acompanhar a tua encomenda a qualquer altura.
              </p>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 space-y-4">
              <h2 className="font-bold text-base">Resumo</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black leading-tight">{item.name}</p>
                      {item.attributes?.length > 0 && (
                        <p className="text-xs text-black/40">{item.attributes.join(", ")}</p>
                      )}
                      <p className="text-xs text-black/50">Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0">
                      €{Math.round(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-black/10" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/60">Subtotal</span>
                  <span>€{Number(order.subtotal).toFixed(2)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-black/60">Desconto</span>
                    <span className="text-red-600">-€{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-black/60">Envio</span>
                  <span className="text-green-600">Grátis</span>
                </div>
                <hr className="border-black/10" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>€{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={`/encomenda?id=${params.orderId}`}
                className="flex items-center justify-center gap-2 w-full bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-black/80 transition"
              >
                Acompanhar Encomenda <FaArrowRight className="text-sm" />
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 w-full border border-black/20 text-black rounded-full py-3 text-sm font-medium hover:bg-black/5 transition"
              >
                Continuar a Comprar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
