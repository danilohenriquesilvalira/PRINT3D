"use client";

import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import Link from "next/link";
import React from "react";
import { ShoppingCart } from "lucide-react";

const CartBtn = () => {
  const { cart } = useAppSelector((state: RootState) => state.carts);

  return (
    <Link href="/cart" className="relative flex items-center justify-center">
      <ShoppingCart size={20} className="transition-transform duration-150 group-hover:scale-110" />
      {cart && cart.totalQuantities > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-white">
          {cart.totalQuantities}
        </span>
      )}
    </Link>
  );
};

export default CartBtn;
