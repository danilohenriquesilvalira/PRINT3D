import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import Header from "@/components/homepage/Header";
import { createServerClient } from "@/lib/supabase/server";
import { Product } from "@/types/product.types";

// Fallback estático enquanto o Supabase não tiver dados
const fallbackProducts: Product[] = [
  { id: 1, title: "Vaso Espiral Geométrico", srcUrl: "/images/pic1.png", gallery: ["/images/pic1.png", "/images/pic10.png", "/images/pic11.png"], price: 15, discount: { amount: 0, percentage: 0 }, rating: 4.5 },
  { id: 2, title: "Suporte para Auscultadores Gaming", srcUrl: "/images/pic2.png", gallery: ["/images/pic2.png"], price: 20, discount: { amount: 0, percentage: 15 }, rating: 4.0 },
  { id: 3, title: "Dragão Articulado Flexível", srcUrl: "/images/pic3.png", gallery: ["/images/pic3.png"], price: 14, discount: { amount: 0, percentage: 0 }, rating: 4.8 },
  { id: 4, title: "Lampada Litofane Personalizada", srcUrl: "/images/pic4.png", gallery: ["/images/pic4.png", "/images/pic10.png", "/images/pic11.png"], price: 39, discount: { amount: 0, percentage: 10 }, rating: 5.0 },
  { id: 5, title: "Pack Animais Articulados (5 peças)", srcUrl: "/images/pic5.png", gallery: ["/images/pic5.png", "/images/pic10.png", "/images/pic11.png"], price: 20, discount: { amount: 0, percentage: 20 }, rating: 5.0 },
  { id: 6, title: "Porta-Velas Geométrico", srcUrl: "/images/pic6.png", gallery: ["/images/pic6.png"], price: 10, discount: { amount: 0, percentage: 0 }, rating: 4.5, stock: false },
  { id: 7, title: "Organizador de Cabos USB", srcUrl: "/images/pic7.png", gallery: ["/images/pic7.png"], price: 8, discount: { amount: 0, percentage: 0 }, rating: 4.0 },
  { id: 8, title: "Vaso de Parede Minimalista", srcUrl: "/images/pic8.png", gallery: ["/images/pic8.png"], price: 13, discount: { amount: 0, percentage: 0 }, rating: 4.5 },
  { id: 12, title: "Suporte Multiuso para Secretária", srcUrl: "/images/pic12.png", gallery: ["/images/pic12.png"], price: 25, discount: { amount: 0, percentage: 20 }, rating: 4.0 },
  { id: 13, title: "Escultura Abstrata de Mesa", srcUrl: "/images/pic13.png", gallery: ["/images/pic13.png"], price: 19, discount: { amount: 0, percentage: 0 }, rating: 3.5 },
  { id: 14, title: "Cortador de Bolachas Temático", srcUrl: "/images/pic14.png", gallery: ["/images/pic14.png"], price: 9, discount: { amount: 0, percentage: 0 }, rating: 4.5 },
  { id: 15, title: "Miniatura RPG Pack 3 Figuras", srcUrl: "/images/pic15.png", gallery: ["/images/pic15.png"], price: 27, discount: { amount: 0, percentage: 15 }, rating: 5.0 },
];


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
    isFeatured: p.is_featured as boolean | undefined,
    isNew: p.is_new as boolean | undefined,
    isTopSelling: p.is_top_selling as boolean | undefined,
  };
}

async function getProducts() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error || !data?.length) return fallbackProducts;
    return data.map(mapRow);
  } catch {
    return fallbackProducts;
  }
}

const iconDestaques = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.9668 10.4961V15.4979C2.9668 18.3273 2.9668 19.742 3.84548 20.621C4.72416 21.5001 6.13837 21.5001 8.9668 21.5001H14.9668C17.7952 21.5001 19.2094 21.5001 20.0881 20.621C20.9668 19.742 20.9668 18.3273 20.9668 15.4979V10.4961" />
    <path d="M14.9668 16.9932C14.2827 17.6004 13.1936 17.9932 11.9668 17.9932C10.74 17.9932 9.65089 17.6004 8.9668 16.9932" />
    <path d="M10.1038 8.41848C9.82182 9.43688 8.79628 11.1936 6.84777 11.4482C5.12733 11.673 3.82246 10.922 3.48916 10.608C3.12168 10.3534 2.28416 9.53872 2.07906 9.02952C1.87395 8.52032 2.11324 7.41706 2.28416 6.96726L2.96743 4.98888C3.13423 4.49196 3.5247 3.31666 3.92501 2.91913C4.32533 2.5216 5.13581 2.5043 5.4694 2.5043H12.4749C14.2781 2.52978 18.2209 2.48822 19.0003 2.50431C19.7797 2.52039 20.2481 3.17373 20.3848 3.45379C21.5477 6.27061 22 7.88382 22 8.57124C21.8482 9.30456 21.22 10.6873 19.0003 11.2955C16.6933 11.9275 15.3854 10.6981 14.9751 10.2261M9.15522 10.2261C9.47997 10.625 10.4987 11.4279 11.9754 11.4482C13.4522 11.4686 14.7273 10.4383 15.1802 9.92062C15.3084 9.76786 15.5853 9.31467 15.8725 8.41848" />
  </svg>
);

const iconNovidades = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
  </svg>
);

const iconMaisProcurados = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

export default async function Home() {
  const allProducts = await getProducts();

  const destaquesData = allProducts.filter((p) => p.isFeatured).slice(0, 4);
  const newArrivalsData = allProducts.filter((p) => p.isNew).slice(0, 4);
  const topSellingData = allProducts.filter((p) => p.isTopSelling).slice(0, 4);

  // Fallback se as flags não estiverem definidas
  const destaques = destaquesData.length ? destaquesData : allProducts.slice(0, 4);
  const novidades = newArrivalsData.length ? newArrivalsData : allProducts.slice(0, 4);
  const maisProcurados = topSellingData.length ? topSellingData : allProducts.slice(4, 8);

  return (
    <div className="bg-[#F2F0F1]">
      <Header />
      <Brands />
      <main className="py-8 sm:py-10">
        <div className="mb-7 sm:mb-9">
          <ProductListSec title="DESTAQUES" data={destaques} viewAllLink="/shop" icon={iconDestaques} />
        </div>
        <div className="mb-7 sm:mb-9">
          <ProductListSec title="NOVIDADES" data={novidades} viewAllLink="/shop#new-arrivals" icon={iconNovidades} />
        </div>
        <div className="mb-7 sm:mb-9">
          <ProductListSec title="OS MAIS PROCURADOS" data={maisProcurados} viewAllLink="/shop#top-selling" icon={iconMaisProcurados} />
        </div>
      </main>
    </div>
  );
}
