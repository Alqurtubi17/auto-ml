"use client";
import { TemplateConfig } from "@/types";
import { CheckCircle2, Cpu, Clock, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  template: TemplateConfig;
  selected: boolean;
  onSelect: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  saas: "SaaS", ecommerce: "E-Commerce", portfolio: "Portfolio",
  blog: "Blog", restaurant: "Restaurant", realestate: "Real Estate",
  healthcare: "Healthcare", education: "Education", agency: "Agency", startup: "Startup",
};

export function TemplateCard({ template, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={clsx(
        "group relative w-full text-left rounded-xl border transition-all duration-200 p-5",
        "hover:shadow-md hover:-translate-y-0.5",
        selected
          ? "border-zinc-900 bg-white shadow-md"
          : "border-zinc-100 bg-white shadow-sm hover:border-zinc-300"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0"
          style={{ backgroundColor: template.accent + "18", borderColor: template.accent + "30", border: "1px solid" }}
        >
          <div className="w-full h-full rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: template.accent }} />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
            {CATEGORY_LABELS[template.category]}
          </span>
          {selected && (
            <CheckCircle2 className="w-4 h-4 text-zinc-900 flex-shrink-0" />
          )}
        </div>
      </div>

      <h3 className="font-semibold text-zinc-900 text-sm mb-1">{template.name}</h3>
      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 mb-4">{template.description}</p>

      <div className="border-t border-zinc-50 pt-3 space-y-2">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Cpu className="w-3 h-3" />
          <span className="text-[11px]">{template.mlFeatures[0]}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3 h-3" />
            <span className="text-[11px]">~{template.estimatedBuildSec}s build</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px]">{template.sections.length} sections</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${template.accent}` }}
        />
      )}
    </button>
  );
}
