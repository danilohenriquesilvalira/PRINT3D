"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { archivoBlack } from "@/styles/fonts";
import { FaArrowRight, FaLock, FaCircleCheck } from "react-icons/fa6";
import { MdOutlineLocalShipping, MdCreditCard } from "react-icons/md";
import { TbTruck, TbShieldCheck } from "react-icons/tb";
import { createClient } from "@/lib/supabase/client";

const StripePayment = dynamic(
  () => import("@/components/checkout/StripePayment"),
  { ssr: false }
);

type FormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  street: string;
  doorNumber: string;
  floor: string;
  city: string;
  postalCode: string;
  country: string;
  nif: string;
  notes: string;
  paymentMethod: "entrega" | "cartao";
};

const initialForm: FormData = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  street: "",
  doorNumber: "",
  floor: "",
  city: "",
  postalCode: "",
  country: "Portugal",
  nif: "",
  notes: "",
  paymentMethod: "entrega",
};

type CheckoutStep = "form" | "payment";

const STEPS = [
  { key: "cart", label: "Carrinho" },
  { key: "form", label: "Dados" },
  { key: "payment", label: "Pagamento" },
  { key: "done", label: "Confirmação" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, adjustedTotalPrice, totalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("form");
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState("");

  const total = Math.round(adjustedTotalPrice);
  const discount = Math.round(totalPrice - adjustedTotalPrice);
  const currentStepIdx = step === "form" ? 1 : 2;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setLoggedInEmail(user.email ?? null);
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || name,
        customerEmail: user.email ?? prev.customerEmail,
      }));
    });
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-black/60">O teu carrinho está vazio.</p>
          <Button asChild className="rounded-full bg-black">
            <Link href="/shop">Ver Loja</Link>
          </Button>
        </div>
      </main>
    );
  }

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.customerName.trim()) e.customerName = "Nome obrigatório";
    if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = "Email inválido";
    if (!form.customerPhone.trim()) e.customerPhone = "Telefone obrigatório";
    if (!form.street.trim()) e.street = "Rua obrigatória";
    if (!form.doorNumber.trim()) e.doorNumber = "Número obrigatório";
    if (!form.city.trim()) e.city = "Cidade obrigatória";
    if (!form.postalCode.trim() || !/^\d{4}-\d{3}$/.test(form.postalCode))
      e.postalCode = "Código postal inválido (ex: 1000-001)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");

    try {
      if (form.paymentMethod === "entrega") {
        // Pagamento na entrega — criar encomenda agora
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerPhone: form.customerPhone,
            shippingAddress: {
              street: form.street,
              doorNumber: form.doorNumber,
              floor: form.floor,
              city: form.city,
              postalCode: form.postalCode,
              country: form.country,
              nif: form.nif || null,
            },
            items: cart!.items.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              attributes: item.attributes,
              discount: item.discount,
            })),
            subtotal: totalPrice,
            discount,
            total,
            paymentMethod: "entrega",
            notes: form.notes || null,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          setServerError(orderData.error ?? "Erro ao criar encomenda");
          return;
        }
        router.push(`/checkout/sucesso/${orderData.order.id}`);
        return;
      }

      // Cartão — criar PaymentIntent ANTES de qualquer encomenda
      const piRes = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          customerEmail: form.customerEmail,
          customerName: form.customerName,
        }),
      });

      const piData = await piRes.json();
      if (!piRes.ok || !piData.clientSecret) {
        setServerError("Erro ao iniciar pagamento. Tenta novamente.");
        return;
      }

      setStripeClientSecret(piData.clientSecret);
      setStripePaymentIntentId(piData.paymentIntentId);
      setStep("payment");
    } catch {
      setServerError("Erro de ligação. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: keyof FormData) =>
    cn(
      "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white transition",
      errors[field] ? "border-red-400 focus:ring-red-200" : "border-black/10"
    );

  const shippingAddress = {
    street: form.street,
    doorNumber: form.doorNumber,
    floor: form.floor,
    city: form.city,
    postalCode: form.postalCode,
    country: form.country,
    nif: form.nif || null,
  };

  return (
    <main className="pb-20 bg-[#F2F0F1] min-h-screen">
      <div className="max-w-frame mx-auto px-4 xl:px-0 pt-6">

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i < currentStepIdx
                    ? "bg-black text-white"
                    : i === currentStepIdx
                    ? "bg-black text-white ring-4 ring-black/10"
                    : "bg-black/10 text-black/40"
                )}>
                  {i < currentStepIdx ? <FaCircleCheck className="text-xs" /> : i + 1}
                </div>
                <span className={cn("text-xs mt-1 hidden sm:block", i <= currentStepIdx ? "text-black font-medium" : "text-black/40")}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-[2px] w-12 sm:w-20 mx-1 transition-all", i < currentStepIdx ? "bg-black" : "bg-black/10")} />
              )}
            </div>
          ))}
        </div>

        <h1 className={cn(archivoBlack.className, "font-bold text-[28px] md:text-[36px] text-black uppercase mb-6")}>
          {step === "payment" ? "Pagamento Seguro" : "Finalizar Encomenda"}
        </h1>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* LEFT */}
          <div className="w-full">

            {/* ====== STEP: FORM ====== */}
            {step === "form" && (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Dados Pessoais */}
                <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">1</span>
                    Dados Pessoais
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Nome Completo *</label>
                      <input
                        className={inputClass("customerName")}
                        value={form.customerName}
                        onChange={(e) => set("customerName", e.target.value)}
                        placeholder="João Silva"
                      />
                      {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Email *</label>
                      <div className="relative">
                        <input
                          type="email"
                          className={cn(inputClass("customerEmail"), loggedInEmail ? "bg-[#F8F8F8] text-black/50 cursor-not-allowed pr-20" : "")}
                          value={form.customerEmail}
                          onChange={(e) => !loggedInEmail && set("customerEmail", e.target.value)}
                          readOnly={!!loggedInEmail}
                          placeholder="joao@email.com"
                        />
                        {loggedInEmail && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Google</span>
                        )}
                      </div>
                      {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
                      {loggedInEmail && <p className="text-xs text-black/40 mt-1">Email da conta Google — encomendas ligadas ao perfil</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Telefone *</label>
                      <input
                        type="tel"
                        className={inputClass("customerPhone")}
                        value={form.customerPhone}
                        onChange={(e) => set("customerPhone", e.target.value)}
                        placeholder="+351 912 345 678"
                      />
                      {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">NIF (opcional)</label>
                      <input
                        className={inputClass("nif")}
                        value={form.nif}
                        onChange={(e) => set("nif", e.target.value)}
                        placeholder="123456789"
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>

                {/* Morada */}
                <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">2</span>
                    <MdOutlineLocalShipping className="text-xl" />
                    Morada de Entrega
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-black/70 mb-1 block">Rua *</label>
                      <input
                        className={inputClass("street")}
                        value={form.street}
                        onChange={(e) => set("street", e.target.value)}
                        placeholder="Rua das Flores"
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Número *</label>
                      <input
                        className={inputClass("doorNumber")}
                        value={form.doorNumber}
                        onChange={(e) => set("doorNumber", e.target.value)}
                        placeholder="42"
                      />
                      {errors.doorNumber && <p className="text-red-500 text-xs mt-1">{errors.doorNumber}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Andar / Apt.</label>
                      <input
                        className={inputClass("floor")}
                        value={form.floor}
                        onChange={(e) => set("floor", e.target.value)}
                        placeholder="2º Esq."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Cidade *</label>
                      <input
                        className={inputClass("city")}
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="Lisboa"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black/70 mb-1 block">Código Postal *</label>
                      <input
                        className={inputClass("postalCode")}
                        value={form.postalCode}
                        onChange={(e) => set("postalCode", e.target.value)}
                        placeholder="1000-001"
                        maxLength={8}
                      />
                      {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black/70 mb-1 block">País</label>
                    <select
                      className={cn(inputClass("country"), "cursor-pointer")}
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                    >
                      <option>Portugal</option>
                      <option>Espanha</option>
                      <option>França</option>
                      <option>Alemanha</option>
                      <option>Reino Unido</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-black/70 mb-1 block">Notas (opcional)</label>
                    <textarea
                      className={cn(inputClass("notes"), "resize-none h-20")}
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Instruções especiais de entrega..."
                    />
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 space-y-3">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">3</span>
                    <MdCreditCard className="text-xl" />
                    Método de Pagamento
                  </h2>

                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition",
                    form.paymentMethod === "entrega" ? "border-black bg-black/5" : "border-black/10 hover:border-black/30"
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="entrega"
                      checked={form.paymentMethod === "entrega"}
                      onChange={() => set("paymentMethod", "entrega")}
                      className="accent-black"
                    />
                    <TbTruck className="text-2xl text-black" />
                    <div>
                      <p className="font-semibold text-sm">Pagamento na Entrega</p>
                      <p className="text-xs text-black/50">Paga quando recebes em casa</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition",
                    form.paymentMethod === "cartao" ? "border-black bg-black/5" : "border-black/10 hover:border-black/30"
                  )}>
                    <input
                      type="radio"
                      name="payment"
                      value="cartao"
                      checked={form.paymentMethod === "cartao"}
                      onChange={() => set("paymentMethod", "cartao")}
                      className="accent-black"
                    />
                    <MdCreditCard className="text-2xl text-black" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Cartão de Crédito / Débito</p>
                      <p className="text-xs text-black/50">Pagamento seguro via Stripe — cobrado só após confirmação</p>
                    </div>
                    <div className="flex gap-1">
                      {["Visa", "MC", "Amex"].map((c) => (
                        <span key={c} className="text-[9px] border border-black/10 rounded px-1.5 py-0.5 text-black/40 font-medium">{c}</span>
                      ))}
                    </div>
                  </label>

                  {form.paymentMethod === "cartao" && (
                    <div className="flex items-center gap-2 text-xs text-black/50 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                      <TbShieldCheck className="text-green-600 text-base flex-shrink-0" />
                      A encomenda é criada <strong>apenas após o pagamento ser confirmado</strong>. Nunca cobraremos um cartão inválido.
                    </div>
                  )}
                </div>

                {serverError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                    {serverError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="text-base font-medium bg-black rounded-full w-full h-[56px] group disabled:opacity-50"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />A processar...</>
                  ) : (
                    <>{form.paymentMethod === "cartao" ? "Continuar para Pagamento" : "Confirmar Encomenda"} <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-all" /></>
                  )}
                </Button>

                <p className="text-xs text-black/40 text-center flex items-center justify-center gap-1">
                  <FaLock className="text-xs" /> Dados protegidos e encriptados
                </p>
              </form>
            )}

            {/* ====== STEP: STRIPE PAYMENT ====== */}
            {step === "payment" && stripeClientSecret && (
              <div className="space-y-4">
                <button
                  onClick={() => { setStep("form"); setServerError(""); }}
                  className="text-sm text-black/40 hover:text-black flex items-center gap-1 transition"
                >
                  ← Voltar aos dados
                </button>

                {/* Shipping summary */}
                <div className="bg-white rounded-[20px] border border-black/10 p-4">
                  <p className="text-xs text-black/40 mb-1">A entregar em</p>
                  <p className="text-sm font-medium text-black">{form.street}, {form.doorNumber}{form.floor ? ` ${form.floor}` : ""}</p>
                  <p className="text-sm text-black/60">{form.postalCode} {form.city}, {form.country}</p>
                </div>

                <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6">
                  <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <FaLock className="text-base" />
                    Pagamento com Cartão
                  </h2>
                  <p className="text-xs text-black/40 mb-5">Dados encriptados via Stripe — nunca armazenamos dados do cartão</p>
                  <StripePayment
                    clientSecret={stripeClientSecret}
                    paymentIntentId={stripePaymentIntentId}
                    total={total}
                    subtotal={totalPrice}
                    discount={discount}
                    customerName={form.customerName}
                    customerEmail={form.customerEmail}
                    customerPhone={form.customerPhone}
                    shippingAddress={shippingAddress}
                    items={cart!.items}
                    notes={form.notes}
                    onSuccess={(orderId) => router.push(`/checkout/sucesso/${orderId}`)}
                    onError={(msg) => setServerError(msg)}
                  />
                </div>

                {serverError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
                    {serverError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — Order Summary */}
          <div className="w-full lg:max-w-[380px] sticky top-6">
            <div className="bg-white rounded-[20px] border border-black/10 p-5 md:p-6 space-y-4">
              <h2 className="font-bold text-lg">Resumo da Encomenda</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#F0F0F0] flex-shrink-0">
                      <Image src={item.srcUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.attributes.length > 0 && (
                        <p className="text-xs text-black/40">{item.attributes.join(", ")}</p>
                      )}
                      <p className="text-xs text-black/50">Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold flex-shrink-0">€{Math.round(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <hr className="border-black/10" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span>€{totalPrice}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Desconto</span>
                    <span className="text-red-600">-€{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Envio</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <hr className="border-black/10" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>€{total}</span>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {["SSL Seguro", "Stripe Certificado", "Dados Protegidos"].map((badge) => (
                <span key={badge} className="text-[10px] text-black/30 flex items-center gap-1">
                  <FaLock className="text-[8px]" /> {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
