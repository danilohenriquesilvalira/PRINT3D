import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createServerClient } from "@/lib/supabase/server";
import { Product } from "@/types/product.types";

const LIMIT = 9;

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

async function getProducts(page: number, sort: string, category?: string) {
  try {
    const supabase = createServerClient();
    const offset = (page - 1) * LIMIT;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" });

    if (category) query = query.eq("category", category);

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else if (sort === "rating") query = query.order("rating", { ascending: false });
    else query = query.order("id", { ascending: true });

    query = query.range(offset, offset + LIMIT - 1);

    const { data, count, error } = await query;
    if (error) return { products: [], total: 0 };

    return { products: (data ?? []).map(mapRow), total: count ?? 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string; category?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const sort = searchParams.sort ?? "most-popular";
  const category = searchParams.category;

  const { products, total } = await getProducts(page, sort, category);
  const totalPages = Math.ceil(total / LIMIT);
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filtros</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">Todos os Produtos</h1>
                <MobileFilters />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  A mostrar {total > 0 ? `${start}-${end} de ${total}` : "0"} Produtos
                </span>
                <div className="flex items-center">
                  Ordenar por:{" "}
                  <Select defaultValue={sort}>
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Mais Popular</SelectItem>
                      <SelectItem value="price_asc">Preço Mais Baixo</SelectItem>
                      <SelectItem value="price_desc">Preço Mais Alto</SelectItem>
                      <SelectItem value="rating">Melhor Avaliação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
              {products.map((product) => (
                <div key={product.id} className="flex">
                  <ProductCard data={product} />
                </div>
              ))}
              {products.length === 0 && (
                <p className="col-span-3 text-center text-black/40 py-20">
                  Nenhum produto encontrado.
                </p>
              )}
            </div>
            {totalPages > 1 && (
              <>
                <hr className="border-t-black/10" />
                <Pagination className="justify-between">
                  <PaginationPrevious
                    href={page > 1 ? `?page=${page - 1}&sort=${sort}` : "#"}
                    className="border border-black/10"
                  />
                  <PaginationContent>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href={`?page=${p}&sort=${sort}`}
                          className="text-black/50 font-medium text-sm"
                          isActive={p === page}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                  <PaginationNext
                    href={page < totalPages ? `?page=${page + 1}&sort=${sort}` : "#"}
                    className="border border-black/10"
                  />
                </Pagination>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
