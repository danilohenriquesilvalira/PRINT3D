"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import CartBtn from "./CartBtn";
import { 
  Menu, 
  Search, 
  User, 
  ChevronRight, 
  ShoppingCart, 
  Percent, 
  Sparkles, 
  Zap,
  Home,
  Gamepad2,
  LayoutGrid,
  Gift,
  Boxes,
  X,
  Moon
} from "lucide-react";

const data = [
  {
    id: 1,
    label: "Loja Completa",
    icon: ShoppingCart,
    type: "MenuList",
    children: [
      { id: 11, label: "Decoração", icon: Home, url: "/shop#decoracao" },
      { id: 12, label: "Gaming & Colecionáveis", icon: Gamepad2, url: "/shop#gaming" },
      { id: 13, label: "Organização", icon: LayoutGrid, url: "/shop#organizacao" },
      { id: 14, label: "Presentes Personalizados", icon: Gift, url: "/shop#presentes" },
      { id: 15, label: "Figuras 3D", icon: Boxes, url: "/shop#figuras" },
    ],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "Em Promoção",
    icon: Percent,
    url: "/shop#on-sale",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "Novidades",
    icon: Sparkles,
    url: "/shop#new-arrivals",
    children: [],
  },
  {
    id: 4,
    type: "MenuItem",
    label: "Materiais & Filamentos",
    icon: Zap,
    url: "/shop#materiais",
    children: [],
  },
];

const TopNavbar = () => {
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [headerBottom, setHeaderBottom] = React.useState(68);
  const navRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    
    const updatePos = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom);
      }
    };

    checkScreen();
    updatePos();

    window.addEventListener("resize", () => {
      checkScreen();
      updatePos();
    });
    window.addEventListener("scroll", updatePos);

    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos);
    };
  }, []);

  // Componente do Botão de Menu para evitar repetição
  const MenuToggleButton = ({ className, showLabel = true }: { className?: string, showLabel?: boolean }) => (
    <SheetTrigger asChild>
      <button className={cn(
        "flex items-center justify-center gap-2 rounded-[6px] transition-all font-bold text-[13px] uppercase tracking-wider group active:scale-95 border-none outline-none",
        isOpen 
          ? "bg-red-50 text-red-600 shadow-inner" 
          : "bg-[#F3F3F3] text-black hover:bg-black hover:text-white",
        className
      )}>
        {isOpen ? (
          <X size={20} className="animate-in fade-in zoom-in duration-300" />
        ) : (
          <Menu size={20} className="transition-transform duration-300" />
        )}
        {showLabel && <span className="hidden sm:inline">Menu</span>}
      </button>
    </SheetTrigger>
  );

  return (
    <nav 
      ref={navRef}
      className="sticky top-0 left-0 w-full bg-white z-[110] border-b border-black/[0.08] flex flex-col transition-all"
    >
      <Sheet modal={!isDesktop} open={isOpen} onOpenChange={setIsOpen}>
        {/* LINHA 1: MENU (Desktop) + LOGO + UTILIDADES */}
        <div className="h-[60px] lg:h-[68px] flex items-center justify-between px-4 lg:px-[34px] w-full">
          
          <div className="flex items-center gap-[12px] lg:gap-[24px]">
            {/* Botão de Menu - Apenas Visível no Desktop na Linha 1 */}
            <MenuToggleButton className="hidden lg:flex w-[110px] h-[44px]" />
            
            <Link href="/" className="flex items-center self-center flex-shrink-0">
              <Image
                priority
                src="/images/LOGO_PRINT3D.svg"
                height={28}
                width={72}
                alt="PRINT3D Logo"
                className="h-[17px] lg:h-[22px] w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Search Center */}
          <div className="flex-1 max-w-[600px] hidden lg:flex items-center px-8">
            <div className="relative w-full group">
              <div className="bg-[#F3F3F3] group-focus-within:bg-white border border-transparent group-focus-within:border-black/5 h-[46px] px-12 rounded-[6px] flex items-center transition-all shadow-sm">
                <Search className="absolute left-4 text-red-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="O que procura?"
                  className="w-full bg-transparent border-none outline-none text-sm placeholder:text-black/40 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-[20px]">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 hover:bg-[#F3F3F3] rounded-full transition-all cursor-pointer">
              <Moon size={20} className="text-black/60" />
            </div>

            <div className="flex items-center gap-2 lg:gap-[16px]">
              <Link 
                href="/#signin" 
                className="flex items-center justify-center w-[40px] lg:w-[44px] h-[40px] lg:h-[44px] bg-black lg:bg-[#F3F3F3] text-white lg:text-black lg:hover:bg-black lg:hover:text-white rounded-full transition-all duration-150 active:scale-95 group"
              >
                <User size={18} className="lg:group-hover:scale-110 transition-transform duration-150" />
              </Link>
              <div className="relative w-[40px] lg:w-[44px] h-[40px] lg:h-[44px] flex items-center justify-center bg-[#F3F3F3] rounded-full hover:bg-black text-black hover:text-white transition-all duration-150 cursor-pointer group active:scale-95">
                <CartBtn />
              </div>
            </div>
          </div>
        </div>

        {/* LINHA 2: MENU (Mobile) + PESQUISA (Escondido no Desktop) */}
        <div className="h-[60px] flex lg:hidden items-center gap-2 px-4 pb-2">
          <MenuToggleButton className="flex lg:hidden w-[54px] h-[46px]" showLabel={false} />
          
          <div className="flex-1 relative group">
            <div className="bg-white border border-black/20 h-[46px] px-10 rounded-[6px] flex items-center transition-all">
              <Search className="absolute left-3 text-red-500" size={18} />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full bg-transparent border-none outline-none text-[15px] placeholder:text-black/40 font-medium pl-2"
              />
            </div>
          </div>
        </div>

        <SheetContent 
          side="left" 
          hideOverlay={isDesktop}
          style={{ 
            top: isDesktop ? `${headerBottom + 5}px` : `${headerBottom}px`,
            height: isDesktop ? `calc(100vh - ${headerBottom + 5}px)` : `calc(100vh - ${headerBottom}px)` 
          }}
          className={cn(
            "w-full sm:w-[400px] p-0 overflow-y-auto transition-all duration-300 [&>button]:hidden",
            isDesktop 
              ? "fixed !left-0 !bottom-0 !h-auto !z-[100] border-r border-black/5 shadow-2xl md:rounded-r-2xl" 
              : "fixed !left-0 !bottom-0 !z-[100] border-t border-black/5 shadow-2xl"
          )}
        >
          <div className="p-4 h-full flex flex-col pt-4">
            <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
              {data.map((item) => (
                <div key={item.id} className="w-full">
                  {item.type === "MenuItem" ? (
                    <SheetClose asChild>
                      <Link 
                        href={item.url ?? "/"} 
                        className="flex items-center justify-between w-full py-4 px-3 hover:bg-[#F9F9F9] border-b border-black/[0.03] group transition-all duration-150"
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={22} className="text-red-500" />
                          <span className="font-semibold text-[15px] text-black/80">{item.label}</span>
                        </div>
                        <ChevronRight size={18} className="text-red-500/40 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </SheetClose>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={item.label} className="border-none">
                        <AccordionTrigger className="flex items-center justify-between w-full py-4 px-3 hover:bg-[#F9F9F9] hover:no-underline border-b border-black/[0.03] group transition-all duration-150">
                          <div className="flex items-center gap-4">
                            <item.icon size={22} className="text-red-500" />
                            <span className="font-semibold text-[15px] text-black/80">{item.label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-0 pt-0 border-l-2 border-red-50 ml-8">
                          {item.children.map((child) => (
                            <SheetClose key={child.id} asChild>
                              <Link 
                                href={child.url ?? "/"} 
                                className="flex items-center justify-between py-3 px-4 hover:bg-[#F9F9F9] border-b border-black/[0.03] group transition-all"
                              >
                                <span className="text-sm font-medium text-black/60 group-hover:text-black">{child.label}</span>
                                <ChevronRight size={14} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all" />
                              </Link>
                            </SheetClose>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-black/5 bg-white">
               <p className="text-[10px] font-bold text-black/20 text-center uppercase tracking-widest">© 2026 FORMA3D - PLATAFORMA DE PRECISÃO</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default TopNavbar;
