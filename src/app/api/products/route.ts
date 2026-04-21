import { createServerClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const isNew = searchParams.get("new");
  const topSelling = searchParams.get("top_selling");
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const sort = searchParams.get("sort") ?? "id";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const offset = (page - 1) * limit;

  const supabase = createServerClient();
  let query = supabase.from("products").select("*", { count: "exact" });

  if (category) query = query.eq("category", category);
  if (featured === "true") query = query.eq("is_featured", true);
  if (isNew === "true") query = query.eq("is_new", true);
  if (topSelling === "true") query = query.eq("is_top_selling", true);
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else if (sort === "rating") query = query.order("rating", { ascending: false });
  else query = query.order("id", { ascending: true });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    srcUrl: p.src_url,
    gallery: p.gallery ?? [],
    price: Number(p.price),
    discount: {
      amount: Number(p.discount_amount),
      percentage: Number(p.discount_percentage),
    },
    rating: Number(p.rating),
    stock: p.stock,
    category: p.category,
    description: p.description,
    isFeatured: p.is_featured,
    isNew: p.is_new,
    isTopSelling: p.is_top_selling,
  }));

  return NextResponse.json({ products, total: count ?? 0, page, limit });
}
