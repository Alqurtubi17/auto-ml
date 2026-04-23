import { Code2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function PythonSdkWidget({ project }: any) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col shadow-sm">
        <div className="flex flex-col gap-1 mb-3">
           <div className="flex items-center justify-between">
             <span className="text-[11px] font-black text-zinc-800 flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-emerald-600" /> Code Integration</span>
             <button onClick={() => {
               navigator.clipboard.writeText(project.generatedCode || "");
               toast.success("Copied to clipboard.");
             }} className="text-zinc-400 hover:text-emerald-600 transition-all bg-zinc-50 p-1.5 rounded-md border border-zinc-200">
               <Copy className="w-3 h-3" />
             </button>
           </div>
           <p className="text-[9px] font-bold text-zinc-500">Copy this Python script to use the AI on your local system.</p>
        </div>
        <pre className="flex-1 text-[10px] font-mono text-zinc-600 overflow-x-auto p-3 bg-zinc-900 rounded-lg shadow-inner custom-scrollbar max-h-[180px] text-white/80">
          {project.generatedCode || "# Loading..."}
        </pre>
    </div>
  );
}