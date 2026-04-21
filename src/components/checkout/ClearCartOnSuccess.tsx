"use client";

import { clearCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";
import { useEffect } from "react";

export default function ClearCartOnSuccess() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return null;
}
