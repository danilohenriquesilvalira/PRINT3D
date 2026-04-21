import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { createServerClient } from "@/lib/supabase/server";
import { Product } from "@/types/product.types";
import { notFound } from "next/navigation";

function mapRow(p: Record<string, unknown>): Product {
  return {
    id: p.id as number,
    title: p.title as string,
    srcUrl: p.src_url as string,
    gallery: (p.gallery as string[]) ?? [],
    price: Number(p.price),
    discount: {
      amount: Number(p.discount_amount),
      percentage: Number(p.discount_percentage),
    },
    rating: Number(p.rating),
    stock: p.stock as boolean | undefined,
    category: p.category as string | undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const productId = Number(params.slug[0]);

  if (isNaN(productId)) notFound();

  const supabase = createServerClient();

  const { data: productRow, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !productRow) notFound();

  const productData = mapRow(productRow);

  const { data: relatedRows } = await supabase
    .from("products")
    .select("*")
    .neq("id", productId)
    .eq("category", productRow.category ?? "Geral")
    .limit(4);

  const relatedProducts: Product[] = (relatedRows ?? []).map(mapRow);

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs />
      </div>
      {relatedProducts.length > 0 && (
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec title="Também podes gostar" data={relatedProducts} />
        </div>
      )}
    </main>
  );
}
