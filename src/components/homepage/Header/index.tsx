"use client";

import { cn } from "@/lib/utils";
import { archivoBlack } from "@/styles/fonts";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import {
  Home, Gamepad2, LayoutGrid, Gift, Zap,
  Sparkles, ChevronRight, Boxes, ChevronLeft
} from "lucide-react";

const categories = [
  { id: 1, label: "Decoração",   icon: Home,       url: "/shop#decoracao" },
  { id: 2, label: "Gaming",      icon: Gamepad2,    url: "/shop#gaming" },
  { id: 3, label: "Organização", icon: LayoutGrid,  url: "/shop#organizacao" },
  { id: 4, label: "Presentes",   icon: Gift,        url: "/shop#presentes" },
  { id: 5, label: "Materiais",   icon: Zap,         url: "/shop#materiais" },
  { id: 6, label: "Novidades",   icon: Sparkles,    url: "/shop#new-arrivals" },
  { id: 7, label: "Figuras 3D",  icon: Boxes,       url: "/shop#figuras" },
  { id: 8, label: "Filamentos",  icon: Zap,         url: "/shop#materiais" },
];

const banners = [
  {
    id: 1,
    title: "PRODUTOS IMPRESSOS EM 3D FEITOS COM PRECISÃO",
    description: "Explora a nossa coleção de peças impressas em 3D com materiais de alta qualidade.",
    image: "/images/header-homepage.png",
    mobileImage: "/images/header-res-homepage.png",
    buttonText: "Ver Loja",
    url: "/shop",
  },
  {
    id: 2,
    title: "DESIGN PERSONALIZADO PARA A TUA CASA",
    description: "Cria peças únicas sob medida para os teus espaços. Suportes práticos a arte colecionável.",
    image: "/images/pic1.png",
    mobileImage: "/images/pic1.png",
    buttonText: "Personalizar",
    url: "/shop#personalizados",
  },
  {
    id: 3,
    title: "GAMING & COLECIONÁVEIS DE ALTA QUALIDADE",
    description: "Suportes para auscultadores, miniaturas RPG e muito mais, feitos com os melhores filamentos.",
    image: "/images/pic2.png",
    mobileImage: "/images/pic2.png",
    buttonText: "Ver Gaming",
    url: "/shop#gaming",
  },
];

const Header = () => {
  // API do banner
  const [bannerApi, setBannerApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // API das categorias
  const [catApi, setCatApi] = useState<CarouselApi>();
  const [catCanPrev, setCatCanPrev] = useState(false);
  const [catCanNext, setCatCanNext] = useState(true);

  // Autoplay banner
  useEffect(() => {
    if (!bannerApi) return;
    const interval = setInterval(() => bannerApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [bannerApi]);

  // Track slide actual do banner
  useEffect(() => {
    if (!bannerApi) return;
    const update = () => setCurrentSlide(bannerApi.selectedScrollSnap());
    bannerApi.on("select", update);
    return () => { bannerApi.off("select", update); };
  }, [bannerApi]);

  // Track can scroll das categorias
  useEffect(() => {
    if (!catApi) return;
    const update = () => {
      setCatCanPrev(catApi.canScrollPrev());
      setCatCanNext(catApi.canScrollNext());
    };
    update();
    catApi.on("select", update);
    catApi.on("reInit", update);
    return () => { catApi.off("select", update); catApi.off("reInit", update); };
  }, [catApi]);

  return (
    <header className="bg-[#F2F0F1] pt-4 md:pt-7 pb-7 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-16">

        {/* ── CATEGORIAS ─────────────────────────────────────── */}

        {/* Mobile: pills com scroll nativo horizontal (sem setas) */}
        <div className="md:hidden mb-5 flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.url}
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 bg-white rounded-full border border-black/[0.06] hover:border-black/20 active:scale-95 transition-all"
            >
              <cat.icon size={14} strokeWidth={1.5} className="text-black/60" />
              <span className="text-[11px] font-bold text-black/70 uppercase tracking-tight whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop: carousel com cards e setas */}
        <div className="hidden md:block mb-5 relative">
          <Carousel
            opts={{ align: "start", loop: false }}
            setApi={setCatApi}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {categories.map((cat) => (
                <CarouselItem
                  key={cat.id}
                  className="pl-2 md:basis-1/5 lg:basis-1/6 xl:basis-[12.5%]"
                >
                  <Link
                    href={cat.url}
                    className="flex flex-col items-center justify-center h-[80px] bg-white rounded-xl border border-black/[0.05] hover:border-black/20 hover:shadow-sm transition-all active:scale-95"
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-black/70 mb-2">
                      <cat.icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-center text-black/70 uppercase tracking-tight px-1">
                      {cat.label}
                    </span>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <button
            onClick={() => catApi?.scrollPrev()}
            aria-label="Anterior"
            className="absolute left-0 top-0 h-[80px] w-9 z-10 flex items-center justify-center bg-white border-r border-black/[0.06] rounded-l-xl text-[#FF0000] transition-all hover:bg-[#F9F9F9] hover:text-red-700"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <button
            onClick={() => catApi?.scrollNext()}
            aria-label="Próximo"
            className="absolute right-0 top-0 h-[80px] w-9 z-10 flex items-center justify-center bg-white border-l border-black/[0.06] rounded-r-xl text-[#FF0000] transition-all hover:bg-[#F9F9F9] hover:text-red-700"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>

        {/* ── BANNER PRINCIPAL ──────────────────────────────── */}
        <div className="relative">
          <Carousel
            setApi={setBannerApi}
            opts={{ align: "start", loop: true }}
            className="w-full overflow-hidden rounded-2xl"
          >
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem
                  key={banner.id}
                  className="relative w-full h-[220px] md:h-[400px] overflow-hidden bg-[#e8e5e2]"
                >
                  {/* Imagem — sem gradiente */}
                  <Image priority src={banner.image} alt={banner.title} fill
                    className="object-cover object-center hidden md:block" />
                  <Image priority src={banner.mobileImage} alt={banner.title} fill
                    className="object-cover object-center md:hidden opacity-25" />

                  {/* Card de texto — lado esquerdo, sem blur nem gradiente */}
                  <div className="absolute inset-0 z-10 flex items-center px-5 md:px-10">
                    <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 max-w-[240px] md:max-w-[440px] shadow-md">
                      <h2 className={cn(
                        archivoBlack.className,
                        "text-[16px] md:text-[34px] md:leading-[1.05] tracking-tight text-black uppercase mb-2 md:mb-4"
                      )}>
                        {banner.title}
                      </h2>
                      <p className="text-black/60 text-[11px] md:text-sm leading-relaxed mb-4 md:mb-6 hidden sm:block">
                        {banner.description}
                      </p>
                      <Link
                        href={banner.url}
                        className="inline-flex items-center gap-1.5 bg-black hover:bg-black/80 transition-all text-white px-5 md:px-8 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm active:scale-95"
                      >
                        {banner.buttonText}
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Controles do banner — canto inferior direito, longe do card de texto */}
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => bannerApi?.scrollPrev()}
              aria-label="Slide anterior"
              className="h-7 w-7 bg-white rounded-full border border-black/10 flex items-center justify-center text-[#FF0000] shadow-sm hover:bg-[#F9F9F9] hover:text-red-700 transition-all active:scale-95"
            >
              <ChevronLeft size={14} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => bannerApi?.scrollTo(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={cn(
                    "h-[3px] rounded-full transition-all duration-500",
                    index === currentSlide ? "w-7 bg-black" : "w-2.5 bg-black/25"
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => bannerApi?.scrollNext()}
              aria-label="Próximo slide"
              className="h-7 w-7 bg-white rounded-full border border-black/10 flex items-center justify-center text-[#FF0000] shadow-sm hover:bg-[#F9F9F9] hover:text-red-700 transition-all active:scale-95"
            >
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
