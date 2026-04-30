"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingSection({ settings }: { settings?: any }) {
  // Ambil harga dari DB, konversi ke format 'k' (misal 99000 -> 99)
  const rawPrice = parseInt(settings?.ENTERPRISE_PRICE || "99000");
  const displayPrice = isNaN(rawPrice) ? "99" : (rawPrice / 1000);

  return (
    <section id="pricing" className="w-full bg-transparent py-32 md:py-40">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        <header className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter mb-6">
            One Price. Lifetime Access.
          </h2>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
            Eliminate monthly subscriptions. Focus on developing your models with an affordable one-time investment.
          </p>
        </header>

        <div className="w-full max-w-md bg-white/60 backdrop-blur-md border-2 border-emerald-500 rounded-[2.5rem] p-10 shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-bl-2xl">
            Best Value
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-black text-zinc-900 mb-2">Lifetime Access</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-400 line-through">Rp150k</span>
              <span className="text-5xl font-black text-zinc-900">Rp{displayPrice}k</span>
            </div>
            <p className="text-zinc-400 font-bold mt-1">/forever</p>
          </div>

          <ul className="space-y-4 mb-10">
            {[
              "Unlimited Data Input (CSV/Excel)",
              "Smart Auto-Preprocessing",
              "Multi-Algorithm Training",
              "Export to Streamlit & Gradio",
              "Download Model Files (.pkl)",
              "Access to All Future Updates"
            ].map((feature, i) => (
              <li key={i} className="flex gap-3 items-center text-zinc-600 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <Link href="/login?mode=register" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 group">
            Secure Access Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <p className="text-center text-zinc-400 text-xs mt-6 font-bold uppercase tracking-widest">
            Pay Once. No Hidden Fees.
          </p>
        </div>
      </div>
    </section>
  );
}