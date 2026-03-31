import React from "react";
import { FooterLinks } from "./footer.types";
import Link from "next/link";

const footerLinksData: FooterLinks[] = [
  {
    id: 1,
    title: "Loja",
    children: [
      { id: 11, label: "Todos os Produtos", url: "/shop" },
      { id: 12, label: "Novidades", url: "/shop#new-arrivals" },
      { id: 13, label: "Em Promoção", url: "/shop#on-sale" },
      { id: 14, label: "Encomenda Personalizada", url: "/shop#personalizados" },
    ],
  },
  {
    id: 2,
    title: "Ajuda",
    children: [
      { id: 21, label: "Como Encomendar", url: "#" },
      { id: 22, label: "Prazos de Entrega", url: "#" },
      { id: 23, label: "Devoluções e Trocas", url: "#" },
      { id: 24, label: "Contacto & Suporte", url: "#" },
    ],
  },
  {
    id: 3,
    title: "Legal",
    children: [
      { id: 31, label: "Política de Privacidade", url: "#" },
      { id: 32, label: "Termos e Condições", url: "#" },
      { id: 33, label: "Política de Cookies", url: "#" },
      { id: 34, label: "Livro de Reclamações", url: "https://www.livroreclamacoes.pt" },
    ],
  },
];

const LinksSection = () => {
  return (
    <>
      {footerLinksData.map((item) => (
        <section className="flex flex-col mt-5 lg:mt-0" key={item.id}>
          <h3 className="font-bold text-xs uppercase tracking-widest text-white mb-5">
            {item.title}
          </h3>
          {item.children.map((link) => (
            <Link
              href={link.url}
              key={link.id}
              target={link.url.startsWith("https") ? "_blank" : undefined}
              rel={link.url.startsWith("https") ? "noopener noreferrer" : undefined}
              className="text-white/50 hover:text-white text-sm mb-3 w-fit transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </section>
      ))}
    </>
  );
};

export default LinksSection;
