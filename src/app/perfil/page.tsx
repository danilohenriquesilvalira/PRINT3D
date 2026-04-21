"use client";

import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";
import { archivoBlack } from "@/styles/fonts";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TbPackage, TbLogout } from "react-icons/tb";
import { MdOutlineLocalShipping } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa6";
import type { User } from "@supabase/supabase-js";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente:      { label: "Pendente",       color: "bg-yellow-100 text-yellow-700" },
  confirmada:    { label: "Confirmada",     color: "bg-blue-100 text-blue-700" },
  em_preparacao: { label: "Em Preparação",  color: "bg-purple-100 text-purple-700" },
  enviada:       { label: "Enviada",        color: "bg-orange-100 text-orange-700" },
  entregue:      { label: "Entregue",       color: "bg-green-100 text-green-700" },
  cancelada:     { label: "Cancelada",      color: "bg-red-100 text-red-700" },
};

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  tracking_code: string | null;
  payment_status: string;
  payment_method: string;
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login?next=/perfil");
        return;
      }
      setUser(user);

      const res = await fetch(`/api/orders/user?email=${encodeURIComponent(user.email!)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? []);
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2F0F1] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Utilizador";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
  const initials = name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();
  const totalGasto = orders.reduce((acc, o) => acc + Number(o.total), 0);

  return (
    <main className="pb-20 bg-[#F2F0F1] min-h-screen">
      <div className="max-w-frame mx-auto px-4 xl:px-0 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-[20px] border border-black/10 p-6 text-center">
              <div className="flex justify-center mb-3">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={name} width={72} height={72} className="rounded-full border-2 border-black/10" />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">{initials}</div>
                )}
              </div>
              <h2 className="font-bold text-base text-black">{name}</h2>
              <p className="text-xs text-black/50 mt-1 break-all">{user.email}</p>
              <div className="mt-3 pt-3 border-t border-black/5 text-xs text-black/40">
                Membro desde {new Date(user.created_at).toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-black/10 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/60">Total de Encomendas</span>
                <span className="font-bold text-black">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/60">Total Gasto</span>
                <span className="font-bold text-black">€{totalGasto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/60">Entregues</span>
                <span className="font-bold text-green-600">{orders.filter((o) => o.status === "entregue").length}</span>
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-black/10 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-black/5 text-sm font-semibold">
                <TbPackage className="text-lg" />As Minhas Encomendas
              </div>
              <Link href="/shop" className="flex items-center gap-3 px-5 py-4 border-b border-black/5 text-sm text-black/60 hover:bg-[#F8F8F8] transition">
                <MdOutlineLocalShipping className="text-lg" />Continuar a Comprar
              </Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-500 hover:bg-red-50 transition text-left">
                <TbLogout className="text-lg" />Terminar Sessão
              </button>
            </div>
          </div>

          {/* Encomendas */}
          <div className="lg:col-span-3">
            <h1 className={cn(archivoBlack.className, "font-bold text-[24px] md:text-[32px] text-black uppercase mb-5")}>
              As Minhas Encomendas
            </h1>

            {orders.length === 0 ? (
              <div className="bg-white rounded-[20px] border border-black/10 p-12 text-center">
                <TbPackage className="text-5xl text-black/20 mx-auto mb-4" />
                <p className="text-black/40 mb-4">Ainda não fizeste nenhuma encomenda.</p>
                <Link href="/shop" className="inline-flex items-center gap-2 bg-black text-white rounded-full px-6 py-2.5 text-sm font-medium hover:bg-black/80 transition">
                  Ver Loja <FaArrowRight className="text-xs" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <div key={order.id} className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs text-black/40 mb-1">Referência</p>
                          <p className="font-mono font-bold text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", status.color)}>{status.label}</span>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-black/70">
                            <span>{item.name} × {item.quantity}</span>
                            <span className="font-medium">€{Math.round(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && <p className="text-xs text-black/40">+{order.items.length - 3} outros itens</p>}
                      </div>

                      <hr className="border-black/5 mb-3" />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-black/40">{new Date(order.created_at).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}</p>
                          <p className="text-xs text-black/50">
                            Pagamento:{" "}
                            <span className={cn("font-semibold", order.payment_status === "pago" ? "text-green-600" : order.payment_status === "falhado" ? "text-red-500" : "text-yellow-600")}>
                              {order.payment_status === "pago" ? "✓ Pago" : order.payment_status === "falhado" ? "✗ Falhado" : "⏳ Pendente"}
                            </span>
                            {" · "}{order.payment_method === "cartao" ? "Cartão" : "Na Entrega"}
                          </p>
                          {order.tracking_code && <p className="text-xs text-black/60">Rastreio: <span className="font-mono font-semibold">{order.tracking_code}</span></p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base">€{Number(order.total).toFixed(2)}</span>
                          <Link href={`/encomenda?id=${order.id}`} className="flex items-center gap-1.5 text-xs font-medium bg-black text-white rounded-full px-4 py-2 hover:bg-black/80 transition">
                            Rastrear <FaArrowRight className="text-[10px]" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
