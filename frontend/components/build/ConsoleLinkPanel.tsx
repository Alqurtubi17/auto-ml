import { LayoutTemplate, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ConsoleLinkPanel({ project }: any) {
  return (
    <div className="p-6 bg-zinc-900 rounded-[1.25rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg relative overflow-hidden group">
       <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
       <div className="relative z-10">
         <h3 className="text-sm font-black flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-emerald-400" /> Deployment UI Console</h3>
         <p className="text-[10px] text-zinc-400 mt-1 max-w-sm leading-relaxed">System is ready to use. Build an interactive web app dashboard based on Streamlit or Gradio using this AI model.</p>
       </div>
       <Link href={`/build/${project.id}/deploy`} className="relative z-10 w-full md:w-auto px-6 py-3 bg-emerald-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
          Open Console <ExternalLink className="w-3.5 h-3.5" />
       </Link>
    </div>
  );
}