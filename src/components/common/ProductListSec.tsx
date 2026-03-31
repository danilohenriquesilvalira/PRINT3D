"use client";

import React, { useState, useEffect } from "react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { archivoBlack } from "@/styles/fonts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product.types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductListSecProps = {
  title: string;
  data: Product[];
  viewAllLink?: string;
  icon?: React.ReactNode;
};

const ProductListSec = ({ title, data, viewAllLink, icon }: ProductListSecProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api || !icon) return;

    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    update();
    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api, icon]);

  if (icon) {
    return (
      <section className="max-w-frame mx-auto">
        {/* Cabeçalho: ícone + título à esquerda | paginação + Ver todos à direita */}
        <motion.div
          initial={{ y: "30px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-4 xl:px-0 mb-5"
        >
          {/* Esquerda: ícone + título */}
          <div className="flex items-center gap-2">
            {icon}
            <h2
              className={cn([
                archivoBlack.className,
                "text-[17px] md:text-[21px] uppercase tracking-wide",
              ])}
            >
              {title}
            </h2>
          </div>

          {/* Direita: Ver todos | seta ← | retângulos | seta → */}
          <div className="flex items-center gap-3">
            {viewAllLink && (
              <>
                <Link
                  href={viewAllLink}
                  className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black underline underline-offset-4 decoration-black/20 hover:decoration-black/60 transition-all duration-300"
                >
                  Ver todos
                </Link>
                <span className="w-px h-4 bg-black/20" />
              </>
            )}

            <button
              onClick={() => api?.scrollPrev()}
              disabled={current === 0}
              aria-label="Anterior"
              className="text-[#FF0000] hover:text-red-700 transition-colors disabled:opacity-20"
            >
              <ChevronLeft size={18} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "h-[5px] rounded-sm transition-all duration-400",
                    i === current
                      ? "w-7 bg-black"
                      : "w-3.5 bg-black/25 hover:bg-black/45"
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => api?.scrollNext()}
              disabled={current === count - 1}
              aria-label="Próximo"
              className="text-[#FF0000] hover:text-red-700 transition-colors disabled:opacity-20"
            >
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </motion.div>

        {/* Carrossel de produtos */}
        <motion.div
          initial={{ y: "30px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Carousel
            opts={{ align: "start" }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="px-4 xl:px-0 -ml-3 sm:-ml-5">
              {data.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="pl-3 sm:pl-5 basis-auto flex"
                >
                  <div className="w-[198px] sm:w-[295px]">
                    <ProductCard data={product} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </motion.div>
      </section>
    );
  }

  // Estilo original centrado (para "You might also like" na página de produto)
  return (
    <section className="max-w-frame mx-auto text-center px-4 xl:px-0">
      <motion.h2
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn([
          archivoBlack.className,
          "text-[32px] md:text-5xl mb-8 md:mb-14 capitalize",
        ])}
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Carousel opts={{ align: "start" }} className="w-full mb-6 md:mb-9">
          <CarouselContent className="px-4 xl:px-0 -ml-3 sm:-ml-5">
            {data.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-3 sm:pl-5 basis-auto flex"
              >
                <div className="w-[198px] sm:w-[295px]">
                  <ProductCard data={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {viewAllLink && (
          <div className="w-full px-4 sm:px-0 text-center">
            <Link
              href={viewAllLink}
              className="w-full inline-block sm:w-[218px] px-[54px] py-4 border rounded-full hover:bg-black hover:text-white text-black transition-all font-medium text-sm sm:text-base border-black/10"
            >
              View All
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductListSec;
