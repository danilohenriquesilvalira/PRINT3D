import { createServerClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", Number(params.id))
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    srcUrl: data.src_url,
    gallery: data.gallery ?? [],
    price: Number(data.price),
    discount: {
      amount: Number(data.discount_amount),
      percentage: Number(data.discount_percentage),
    },
    rating: Number(data.rating),
    stock: data.stock,
    category: data.category,
    description: data.description,
    isFeatured: data.is_featured,
    isNew: data.is_new,
    isTopSelling: data.is_top_selling,
  });
}
