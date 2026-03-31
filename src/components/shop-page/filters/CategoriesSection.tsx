import Link from "next/link";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";

type Category = {
  title: string;
  slug: string;
};

const categoriesData: Category[] = [
  {
    title: "Decoração",
    slug: "/shop?category=decoracao",
  },
  {
    title: "Gaming & Colecionáveis",
    slug: "/shop?category=gaming",
  },
  {
    title: "Organização",
    slug: "/shop?category=organizacao",
  },
  {
    title: "Presentes Personalizados",
    slug: "/shop?category=presentes",
  },
  {
    title: "Cozinha",
    slug: "/shop?category=cozinha",
  },
  {
    title: "Brinquedos",
    slug: "/shop?category=brinquedos",
  },
];

const CategoriesSection = () => {
  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      {categoriesData.map((category, idx) => (
        <Link
          key={idx}
          href={category.slug}
          className="flex items-center justify-between py-2"
        >
          {category.title} <MdKeyboardArrowRight />
        </Link>
      ))}
    </div>
  );
};

export default CategoriesSection;
