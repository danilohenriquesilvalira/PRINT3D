"use client";

import { Product } from "@/types/product.types";
import { Search, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const PhotoSection = ({ data }: { data: Product }) => {
  const [selected, setSelected] = useState<string>(data.srcUrl);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);

  return (
    <div className="flex flex-col-reverse lg:flex-row lg:space-x-3.5">
      {data?.gallery && data.gallery.length > 0 && (
        <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3.5 w-full lg:w-fit items-center lg:justify-start justify-center">
          {data.gallery.map((photo, index) => (
            <button
              key={index}
              type="button"
              className="bg-[#F0EEED] rounded-[13px] xl:rounded-[20px] w-full max-w-[111px] xl:max-w-[152px] max-h-[106px] xl:max-h-[167px] xl:min-h-[167px] aspect-square overflow-hidden"
              onClick={() => setSelected(photo)}
            >
              <Image
                src={photo}
                width={152}
                height={167}
                className="rounded-md w-full h-full object-cover hover:scale-110 transition-all duration-500"
                alt={data.title}
                priority
              />
            </button>
          ))}
        </div>
      )}

      <div
        className={`relative flex items-center justify-center bg-[#F0EEED] rounded-[13px] sm:rounded-[20px] w-full sm:w-96 md:w-full mx-auto h-full max-h-[530px] min-h-[330px] lg:min-h-[380px] xl:min-h-[530px] overflow-hidden mb-3 lg:mb-0 group/main ${
          isZoomEnabled ? "cursor-zoom-out" : "cursor-default"
        }`}
        onMouseMove={(e) => {
          if (!isZoomEnabled) return;
          const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - left) / width) * 100;
          const y = ((e.clientY - top) / height) * 100;
          const img = e.currentTarget.querySelector("img");
          if (img) {
            img.style.transformOrigin = `${x}% ${y}%`;
          }
        }}
      >
        {/* Ícone de Lupa para ativar Zoom */}
        <button
          onClick={() => setIsZoomEnabled(!isZoomEnabled)}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isZoomEnabled 
              ? "bg-red-500 text-white shadow-lg rotate-90" 
              : "bg-white text-black shadow-md hover:bg-black hover:text-white"
          }`}
          title={isZoomEnabled ? "Desativar Zoom" : "Ativar Lupa de Zoom"}
        >
          {isZoomEnabled ? <X size={20} /> : <Search size={20} />}
        </button>

        <Image
          src={selected}
          width={444}
          height={530}
          className={`rounded-md w-full h-full object-cover transition-transform duration-200 ${
            isZoomEnabled ? "group-hover/main:scale-[2.5]" : "scale-100"
          }`}
          alt={data.title}
          priority
          unoptimized
        />
      </div>
    </div>
  );
};

export default PhotoSection;
