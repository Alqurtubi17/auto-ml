"use client";

import { useState } from "react";
import { X, Phone, Mail, MapPin } from "lucide-react";
import LarikLogo from "./LarikLogo";

export default function LandingFooter() {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="w-full bg-white border-t border-zinc-200 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <LarikLogo className="mb-6" />
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                Empowering businesses with automated intelligence. Turn your data into decisions in minutes.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-600">
                <li><a href="#pipeline" className="hover:text-emerald-600 transition-colors">Pipeline</a></li>
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-600">
                <li><button onClick={() => setActiveModal("privacy")} className="hover:text-emerald-600 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModal("terms")} className="hover:text-emerald-600 transition-colors">Terms of Service</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Contact</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-600">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-emerald-500" /> 085123700712</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-emerald-500" /> solutionist1226@gmail.com</li>
                <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-emerald-500" /> Surabaya, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col md:row items-center justify-between gap-4">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              © 2026 LarikAI Architecture. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-zinc-100">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
                {activeModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </h2>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-full flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto text-zinc-600 text-sm font-medium leading-relaxed space-y-4">
              {activeModal === "privacy" ? (
                <>
                  <p>At Larik AI, your privacy is our core priority. We only process the data you upload for the purpose of machine learning model training.</p>
                  <p>Once your model is generated and the session expires, your raw datasets are automatically purged from our temporary processing units. We do not sell or share your data with third parties.</p>
                </>
              ) : (
                <>
                  <p>By using Larik AI, you agree to our fair use policy. You are responsible for ensuring that the datasets you upload comply with local and international regulations.</p>
                  <p>Models generated on our platform are your intellectual property. However, we do not guarantee 100% accuracy as model performance depends heavily on the quality of the input data provided.</p>
                </>
              )}
            </div>
            <div className="p-6 border-t border-zinc-100 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}