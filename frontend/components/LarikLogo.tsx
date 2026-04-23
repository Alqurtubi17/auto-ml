"use client";

import Image from "next/image";

export default function LarikLogo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center  ${className}`} suppressHydrationWarning>
      <div className="w-15 h-15 flex items-center justify-center shrink-0 mt-2">
        <Image 
          src="/icon.png" 
          alt="Larik AI Logo"   
          width={50} 
          height={50} 
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-emerald-600 to-zinc-900">
        Larik AI
      </span>
    </div>
  );
}