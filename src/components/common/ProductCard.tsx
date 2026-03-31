"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import Rating from "../ui/Rating";
import { Product } from "@/types/product.types";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";

type ProductCardProps = {
  data: Product;
};

const ProductCard = ({ data }: ProductCardProps) => {
  const dispatch = useAppDispatch();

  const finalPrice =
    data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount.amount > 0
      ? data.price - data.discount.amount
      : data.price;

  const hasDiscount = data.discount.percentage > 0 || data.discount.amount > 0;
  const discountLabel =
    data.discount.percentage > 0
      ? `-${data.discount.percentage}%`
      : data.discount.amount > 0
      ? `-€${data.discount.amount}`
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        id: data.id,
        name: data.title,
        srcUrl: data.srcUrl,
        price: data.price,
        discount: data.discount,
        attributes: ["Default", "Default"],
        quantity: 1,
      })
    );
  };

  return (
    <Link
      href={`/shop/product/${data.id}/${data.title.split(" ").join("-")}`}
      className="flex flex-col h-full bg-white rounded-[16px] lg:rounded-[20px] overflow-hidden border border-black/[0.08] hover:shadow-lg hover:border-black/[0.14] transition-all duration-300 group"
    >
      {/* Imagem com badge de desconto */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#F7F7F7] flex items-center justify-center">
        <Image
          src={data.srcUrl}
          width={295}
          height={295}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={data.title}
          priority
        />
        {discountLabel && (
          <div className="absolute top-2.5 left-2.5 bg-[#FF0000] text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
            {discountLabel}
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div className="flex flex-col flex-1 p-3 xl:p-4 gap-2">

        {/* Rating */}
        <div className="flex items-center gap-1.5 h-4">
          <div className="flex items-center">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-100"
              size={14}
              readonly
            />
          </div>
          <span className="text-[11px] text-black/50 font-medium translate-y-[0.5px]">
            {data.rating.toFixed(1)}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-black text-sm font-semibold leading-snug line-clamp-2 flex-1">
          {data.title}
        </h3>

        {/* Stock */}
        <div className="flex items-center gap-1.5">
          {data.stock !== false ? (
            <>
              <div className="flex items-center justify-center w-4 h-4 bg-[#3DAD3D]/10 rounded-full">
                <CheckCircle2 size={10} className="text-[#3DAD3D]" />
              </div>
              <span className="text-[11px] text-[#3DAD3D] font-bold leading-none">
                Em estoque
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-4 h-4 bg-gray-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              </div>
              <span className="text-[11px] text-gray-400 font-bold leading-none">
                Sem estoque
              </span>
            </>
          )}
        </div>

        {/* Linha separadora */}
        <hr className="border-t border-black/[0.07]" />

        {/* Preço + botão carrinho */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold text-black text-lg xl:text-xl leading-none">
              €{finalPrice}
            </span>
            {hasDiscount && (
              <span className="text-black/35 line-through text-sm leading-none">
                €{data.price}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            aria-label="Adicionar ao carrinho"
            className="flex-shrink-0 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#FF0000] transition-colors duration-200 active:scale-95"
          >
            <ShoppingCart size={16} strokeWidth={2} />
          </button>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;
