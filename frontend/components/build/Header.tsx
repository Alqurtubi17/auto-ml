import { CheckCircle2, Download } from "lucide-react";

export default function Header({ project, algo }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200/60">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <h1 className="text-2xl font-black text-zinc-900 leading-none tracking-tight">{project.projectName}</h1>
        </div>
        <p className="text-[11px] font-bold text-zinc-500 ml-6 uppercase tracking-widest">
          {algo} <span className="mx-1 text-zinc-300">•</span> {project.taskType}
        </p>
      </div>
      <div className="flex gap-2">
         <a href={`/api/v1/builds/${project.id}/model`} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-[10px] font-black hover:bg-zinc-800 transition-all uppercase tracking-widest shadow-md">
           <Download className="w-3 h-3" /> Download .joblib
         </a>
      </div>
    </div>
  );
}