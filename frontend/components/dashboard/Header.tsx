import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Studio Center</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1 max-w-sm">Configure predictive pipeline and deploy champion model.</p>
      </div>
    </div>
  );
}