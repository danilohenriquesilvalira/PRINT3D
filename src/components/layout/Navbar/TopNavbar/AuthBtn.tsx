"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { TbPackage, TbLogout } from "react-icons/tb";

export default function AuthBtn() {
  const router = useRouter();
  const [user, setUser] = useState<null | {
    email: string;
    name: string;
    avatar: string | null;
    initials: string;
  }>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Utilizador";
        const initials = name
          .split(" ")
          .slice(0, 2)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase();
        setUser({
          email: user.email ?? "",
          name,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          initials,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const name =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email?.split("@")[0] ||
          "Utilizador";
        const initials = name
          .split(" ")
          .slice(0, 2)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase();
        setUser({
          email: u.email ?? "",
          name,
          avatar: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          initials,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="w-[40px] lg:w-[44px] h-[40px] lg:h-[44px] rounded-full bg-[#F3F3F3] animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center justify-center w-[40px] lg:w-[44px] h-[40px] lg:h-[44px] bg-black lg:bg-[#F3F3F3] text-white lg:text-black lg:hover:bg-black lg:hover:text-white rounded-full transition-all duration-150 active:scale-95 group"
        title="Entrar"
      >
        <User size={18} className="lg:group-hover:scale-110 transition-transform duration-150" />
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center justify-center w-[40px] lg:w-[44px] h-[40px] lg:h-[44px] rounded-full overflow-hidden transition-all duration-150 active:scale-95 border-2",
          open ? "border-black" : "border-transparent hover:border-black/20"
        )}
        title={user.name}
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={44}
            height={44}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-black text-white flex items-center justify-center text-sm font-bold rounded-full">
            {user.initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl border border-black/10 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-black/5">
            <p className="text-sm font-semibold text-black truncate">{user.name}</p>
            <p className="text-xs text-black/40 truncate">{user.email}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-black hover:bg-[#F8F8F8] transition border-b border-black/5"
          >
            <TbPackage className="text-base text-black/60" />
            As Minhas Encomendas
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
          >
            <TbLogout className="text-base" />
            Terminar Sessão
          </button>
        </div>
      )}
    </div>
  );
}
