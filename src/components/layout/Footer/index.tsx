import React from "react";
import { cn } from "@/lib/utils";
import { PaymentBadge, SocialNetworks } from "./footer.types";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import LinksSection from "./LinksSection";
import Image from "next/image";
import NewsLetterSection from "./NewsLetterSection";
import LayoutSpacing from "./LayoutSpacing";

const socialsData: SocialNetworks[] = [
  {
    id: 1,
    icon: <FaInstagram />,
    url: "https://instagram.com",
  },
  {
    id: 2,
    icon: <FaFacebookF />,
    url: "https://facebook.com",
  },
];

const paymentBadgesData: PaymentBadge[] = [
  { id: 1, srcUrl: "/icons/Visa.svg" },
  { id: 2, srcUrl: "/icons/mastercard.svg" },
  { id: 3, srcUrl: "/icons/paypal.svg" },
  { id: 4, srcUrl: "/icons/applePay.svg" },
  { id: 5, srcUrl: "/icons/googlePay.svg" },
];

const Footer = () => {
  return (
    <footer className="mt-10">
      {/* Newsletter */}
      <div className="relative">
        <div className="absolute bottom-0 w-full h-1/2 bg-[#111111]" />
        <div className="px-4">
          <NewsLetterSection />
        </div>
      </div>

      {/* Corpo principal do footer */}
      <div className="bg-[#111111] px-4 pt-12 pb-6">
        <div className="max-w-frame mx-auto">

          {/* Grid: logo/info + links */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 mb-10">

            {/* Coluna empresa */}
            <div className="col-span-2 lg:col-span-4 flex flex-col">
              <Link href="/" className="mb-5 block">
                <Image
                  priority
                  src="/images/LOGO_PRINT3D.svg"
                  height={28}
                  width={110}
                  alt="PRINT3D Logo"
                  className="h-[22px] lg:h-[26px] w-auto object-contain invert"
                />
              </Link>

              <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-[280px]">
                Produtos impressos em 3D feitos com dedicação em Portugal. Personalizados, práticos e com qualidade garantida. Enviamos para toda a Europa.
              </p>

              {/* Info empresa */}
              <div className="text-white/35 text-xs leading-relaxed mb-6 space-y-1">
                <p>Atividade registada em Portugal (ENI)</p>
                <p>NIF: a indicar brevemente</p>
                <p>📧 geral@print3d.pt</p>
                <p>📍 Portugal</p>
              </div>

              {/* Redes sociais */}
              <div className="flex items-center gap-2">
                {socialsData.map((social) => (
                  <Link
                    href={social.url}
                    key={social.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition-all duration-200 text-xs"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Colunas de links */}
            <div className="col-span-2 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:pl-8">
              <LinksSection />
            </div>
          </div>

          {/* Linha separadora */}
          <hr className="border-t border-white/10 mb-6" />

          {/* Barra inferior */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-white/35 text-xs">
                © {new Date().getFullYear()} PRINT3D — Todos os direitos reservados.
              </p>
              <p className="text-white/25 text-[10px] mt-1">
                Atividade registada em Portugal · Sujeito ao direito do consumidor português e europeu
              </p>
            </div>

            {/* Métodos de pagamento */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
              {paymentBadgesData.map((badge) => (
                <span
                  key={badge.id}
                  className="w-[46px] h-[28px] rounded-[4px] bg-white flex items-center justify-center px-1"
                >
                  <Image
                    priority
                    src={badge.srcUrl}
                    width={30}
                    height={18}
                    alt="pagamento"
                    className="max-h-[14px] w-auto"
                  />
                </span>
              ))}
            </div>
          </div>

        </div>
        <LayoutSpacing />
      </div>
    </footer>
  );
};

export default Footer;
