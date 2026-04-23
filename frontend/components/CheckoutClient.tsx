"use client";

import "@uploadthing/react/styles.css"; 
import { useState } from "react";
import { generateDynamicQRIS } from "@/lib/qris";
import { QRCodeSVG } from "qrcode.react";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Wallet, Receipt, MessageCircle, UploadCloud } from "lucide-react";

export default function CheckoutClient({ userName }: { userName: string }) {
  const [totalAmount] = useState(99000);
  const staticQRIS = process.env.NEXT_PUBLIC_STATIC_QRIS || "";
  const dynamicQRIS = generateDynamicQRIS(staticQRIS, totalAmount);
  const [isUploaded, setIsUploaded] = useState(false);

  const waNumber = "6285123700712";
  const waMessage = encodeURIComponent(`Hello Larik AI Admin, I am ${userName}. I have completed the QRIS payment of Rp 99.000 for the Enterprise License. Please process my activation.`);
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-[#f4fbf9] py-16 px-6 font-sans text-slate-800 selection:bg-emerald-200 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* KOLOM KIRI - INFORMASI & KEAMANAN */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="mb-2">
            <h1 className="text-[2.5rem] font-extrabold tracking-tight mb-3 text-slate-800 leading-tight">Complete Payment</h1>
            <p className="text-slate-500 font-medium leading-relaxed text-base">
              Hello, {userName}. Please complete the transaction below to activate your Larik AI Enterprise license.
            </p>
          </div>
          
          {/* Card Invoice */}
          <div className="bg-white border border-emerald-100/60 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
            
            <div className="flex items-center gap-3 mb-8">
              <Receipt className="w-6 h-6 text-emerald-700" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-900">Invoice Summary</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-base">
                <span className="text-slate-500 font-medium">Larik AI License - Lifetime</span>
                <span className="font-bold text-slate-700">Rp 99.000</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-6 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Amount</span>
              <span className="text-3xl font-black text-emerald-600">Rp 99.000</span>
            </div>
          </div>

          {/* Card Keamanan */}
          <div className="bg-white border border-emerald-100/60 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 bg-[#f4fbf9] rounded-2xl flex items-center justify-center shrink-0 border border-emerald-50">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="pt-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Enterprise Security</p>
              <p className="text-sm font-medium text-slate-600 mt-1.5 leading-relaxed">Transactions are protected by Larik AI advanced encryption.</p>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN - INTERAKSI QRIS */}
        <div className="lg:col-span-7 bg-[#f4fbf9] border border-emerald-100/80 rounded-[2.5rem] p-8 lg:p-12 shadow-sm flex flex-col h-full">
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800 mb-8 flex items-center justify-between">
            <span>Scan QRIS</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </h3>
          
          <div className="bg-white rounded-3xl p-8 flex justify-center mb-10 shadow-sm border border-emerald-50 mx-auto w-full max-w-sm">
            <QRCodeSVG value={dynamicQRIS} size={280} level="H" includeMargin={false} className="w-full h-auto" />
          </div>
          
          {/* Pembungkus tombol sekarang diset w-full agar merentang penuh tanpa batasan max-width */}
          <div className="w-full flex-1 flex flex-col justify-end">
            {!isUploaded ? (
              <div className="flex flex-col gap-4 w-full">
                <div className="w-full">
                  <UploadButton
                    endpoint="paymentProof"
                    appearance={{
                      // Menambahkan !w-full dan max-w-none untuk memaksa pelebaran mutlak
                      button: "bg-emerald-600 hover:bg-emerald-500 text-white font-black py-7 px-4 rounded-2xl transition-all outline-none uppercase tracking-widest text-sm border-none shadow-md focus:ring-4 focus:ring-emerald-200 w-full !w-full max-w-none ut-button:w-full ut-button:flex-1",
                      allowedContent: "hidden",
                      container: "w-full m-0 p-0 flex flex-col items-stretch",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return "UPLOADING RECEIPT...";
                        if (ready) return (
                          <div className="flex items-center justify-center gap-3 w-full">
                            <UploadCloud className="w-5 h-5" />
                            <span>Upload Payment Receipt</span>
                          </div>
                        );
                        return "INITIALIZING SYSTEM...";
                      },
                    }}
                    onClientUploadComplete={() => {
                      setIsUploaded(true);
                      toast.success("Receipt uploaded successfully.");
                    }}
                    onUploadError={() => toast.error("Upload failed. Please try again.")}
                  />
                </div>

                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-slate-50 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400 font-black py-5 px-4 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-sm block text-center"
                >
                  <MessageCircle className="w-5 h-5 inline-block" /> 
                  <span>Confirm via WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="w-full bg-white border border-emerald-100 rounded-3xl p-10 text-center shadow-sm">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                <h4 className="text-lg font-black text-emerald-900 uppercase tracking-tight">Verification in Progress</h4>
                <p className="text-sm text-slate-500 mt-3 font-medium leading-relaxed mb-8">
                  Your receipt has been securely uploaded. Please click the button below to send a final confirmation message to our Admin for immediate activation.
                </p>
                <a 
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 px-4 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-md block text-center"
                >
                  <MessageCircle className="w-5 h-5 inline-block" /> Message Admin Now
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}