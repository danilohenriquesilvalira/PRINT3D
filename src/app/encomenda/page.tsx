"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { archivoBlack } from "@/styles/fonts";
import { MdOutlineLocalShipping, MdEmail } from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { FaArrowRight } from "react-icons/fa6";

const STATUS_LABELS: Record<string, { label: string; description: string; color: string }> = {
  pendente: {
    label: "Pendente",
    description: "A tua encomenda foi recebida e está a aguardar confirmação.",
    color: "text-yellow-600",
  },
  confirmada: {
    label: "Confirmada",
    description: "A tua encomenda foi confirmada e será preparada em breve.",
    color: "text-blue-600",
  },
  em_preparacao: {
    label: "Em Preparação",
    description: "Estamos a preparar e embalar a tua encomenda com cuidado.",
    color: "text-purple-600",
  },
  enviada: {
    label: "Enviada",
    description: "A tua encomenda foi entregue ao transportador e está a caminho!",
    color: "text-orange-600",
  },
  entregue: {
    label: "Entregue",
    description: "A tua encomenda foi entregue com sucesso. Obrigado!",
    color: "text-green-600",
  },
  cancelada: {
    label: "Cancelada",
    description: "Esta encomenda foi cancelada. Contacta-nos para mais informações.",
    color: "text-red-600",
  },
};

const STATUS_STEPS = ["pendente", "confirmada", "em_preparacao", "enviada", "entregue"];

type Order = {
  id: string;
  status: string;
  tracking_code: string | null;
  carrier: string | null;
  created_at: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shipping_address: {
    street: string;
    doorNumber: string;
    floor?: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

function TrackingForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrder(idFromUrl);
    }
  }, []);

  async function fetchOrder(id: string) {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders?id=${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError("Encomenda não encontrada. Verifica o ID e tenta novamente.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    fetchOrder(orderId.trim());
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const statusInfo = order ? STATUS_LABELS[order.status] : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Form */}
      <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 mb-6">
        <h2 className="font-bold text-base mb-4">Inserir Referência</h2>
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-black/70 mb-1 block">
              ID da Encomenda
            </label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ex: 3f8a1b2c-..."
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
            />
            <p className="text-xs text-black/40 mt-1">
              Encontras o ID no email de confirmação da encomenda.
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="bg-black rounded-full w-full h-[48px] text-sm font-medium disabled:opacity-50"
          >
            {loading ? "A pesquisar..." : "Pesquisar Encomenda"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </div>

      {/* Order Result */}
      {order && (
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-black/50 mb-1">Referência</p>
                <p className="font-mono font-bold text-black">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-black/50 mb-1">Estado</p>
                <span
                  className={cn(
                    "text-sm font-bold",
                    statusInfo?.color ?? "text-black"
                  )}
                >
                  {statusInfo?.label ?? order.status}
                </span>
              </div>
            </div>

            {statusInfo && (
              <p className="text-sm text-black/60 mb-5 bg-[#F8F8F8] rounded-xl p-3">
                {statusInfo.description}
              </p>
            )}

            {/* Progress Bar */}
            {order.status !== "cancelada" && (
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
                  <div key={step} className="flex flex-col items-center gap-1 z-10 flex-1">
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
                      {STATUS_LABELS[step]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {order.tracking_code && (
              <div className="mt-5 bg-[#F8F8F8] rounded-xl p-4">
                <p className="text-xs text-black/50 mb-1">
                  Código de Rastreio {order.carrier ? `(${order.carrier})` : ""}
                </p>
                <p className="font-mono font-bold text-black text-lg">{order.tracking_code}</p>
                <p className="text-xs text-black/40 mt-1">
                  Usa este código no site do transportador para rastrear.
                </p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <MdOutlineLocalShipping className="text-xl" />
              <h2 className="font-bold text-base">Morada de Entrega</h2>
            </div>
            <p className="text-sm text-black/70">
              {order.shipping_address.street}, {order.shipping_address.doorNumber}
              {order.shipping_address.floor ? `, ${order.shipping_address.floor}` : ""}
            </p>
            <p className="text-sm text-black/70">
              {order.shipping_address.postalCode} {order.shipping_address.city}
            </p>
            <p className="text-sm text-black/70">{order.shipping_address.country}</p>
          </div>

          {/* Items */}
          <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <TbPackage className="text-xl" />
              <h2 className="font-bold text-base">Itens Encomendados</h2>
            </div>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-black/70">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    €{Math.round(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <hr className="border-black/10 my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 w-full border border-black/20 text-black rounded-full py-3 text-sm font-medium hover:bg-black/5 transition"
          >
            Continuar a Comprar <FaArrowRight className="text-sm" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <main className="pb-20 bg-[#F2F0F1] min-h-screen">
      <div className="max-w-frame mx-auto px-4 xl:px-0 pt-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
              <TbPackage className="text-white text-2xl" />
            </div>
          </div>
          <h1
            className={cn(
              archivoBlack.className,
              "font-bold text-[28px] md:text-[36px] text-black uppercase"
            )}
          >
            Acompanhar Encomenda
          </h1>
          <p className="text-black/60 mt-2 text-sm">
            Insere o ID da tua encomenda para ver o estado atual
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-black/40">A carregar...</div>}>
          <TrackingForm />
        </Suspense>
      </div>
    </main>
  );
}
