import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import TopBanner from "@/components/layout/Banner/TopBanner";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import HolyLoader from "holy-loader";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "PRINT3D — Produtos Impressos em 3D",
  description: "Loja de produtos impressos em 3D de alta qualidade, feitos em Portugal com envio para toda a Europa.",
  icons: {
    icon: "/images/LOGO_PRINT3D.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={cn(satoshi.className, "flex flex-col min-h-screen")}>
        <HolyLoader color="#868686" />
        <Providers>
          <TopNavbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
