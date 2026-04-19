"use client";
import { useState } from "react";
import Link from "next/link";
import { useTemplates } from "@/hooks/useTemplates";
import { useBuildStatus } from "@/hooks/useBuildStatus";
import { useSiteGenerate } from "@/hooks/useSiteGenerate";
import { TemplateCard } from "@/components/TemplateCard";
import { MagicBuildButton } from "@/components/MagicBuildButton";
import { BuildStatusPanel } from "@/components/BuildStatusPanel";
import { validateGenerateRequest } from "@/lib/validation";
import { Zap, LayoutGrid, History, Settings, ChevronRight, AlertCircle } from "lucide-react";
import { TemplateCategory } from "@/types";

const CATEGORIES: { value: TemplateCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "Store" },
  { value: "portfolio", label: "Portfolio" },
  { value: "blog", label: "Blog" },
  { value: "restaurant", label: "Food" },
  { value: "realestate", label: "Real Estate" },
  { value: "healthcare", label: "Health" },
  { value: "education", label: "Education" },
  { value: "agency", label: "Agency" },
  { value: "startup", label: "Startup" },
];

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Templates", href: "/", active: true },
  { icon: History, label: "Build History", href: "/history", active: false },
  { icon: Settings, label: "Settings", href: "/settings", active: false },
];

export function DashboardClient() {
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1a1a1a");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { templates } = useTemplates(categoryFilter === "all" ? undefined : categoryFilter);
  const { generate, isMutating, activeBuildId } = useSiteGenerate();
  const { build, isActive } = useBuildStatus(activeBuildId);

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  async function handleBuild() {
    const validation = validateGenerateRequest({
      templateId: selectedId ?? "",
      projectName,
      primaryColor,
      userDescription: description,
    });

    if (!validation.ok) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    await generate({
      templateId: validation.data.templateId,
      projectName: validation.data.projectName,
      primaryColor: validation.data.primaryColor,
      userDescription: validation.data.userDescription ?? "",
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className="w-56 shrink-0 border-r border-zinc-100 bg-white flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">WebForge AI</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
            <Link
              key={label}
              href={href}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
              U
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-900 truncate">User</p>
              <p className="text-[11px] text-zinc-400 truncate">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="px-8 py-5 border-b border-zinc-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">New Project</h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                {selectedTemplate
                  ? <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" />{selectedTemplate.name} selected</span>
                  : "Choose a template, configure, and build."}
              </p>
            </div>
            <MagicBuildButton
              onClick={handleBuild}
              loading={isMutating || isActive}
              disabled={!selectedId}
            />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* ── Template grid ───────────────────────── */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            {/* Category pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoryFilter(c.value)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all
                    ${categoryFilter === c.value
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Validation error – template */}
            {formErrors.templateId && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {formErrors.templateId}
              </div>
            )}

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedId === t.id}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setFormErrors((e) => ({ ...e, templateId: "" }));
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Right config panel ──────────────────── */}
          <aside className="w-72 shrink-0 border-l border-zinc-100 bg-white overflow-y-auto">
            <div className="px-5 py-6 space-y-5">
              <div>
                <p className="section-label mb-3">Project Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Project name</label>
                    <input
                      type="text"
                      placeholder="My awesome site"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        setFormErrors((er) => ({ ...er, projectName: "" }));
                      }}
                      className={`input text-sm ${formErrors.projectName ? "border-red-300 focus:ring-red-200" : ""}`}
                    />
                    {formErrors.projectName && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.projectName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Describe your site</label>
                    <textarea
                      placeholder="A SaaS for project management teams…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="input text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Primary color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value);
                          setFormErrors((er) => ({ ...er, primaryColor: "" }));
                        }}
                        className="w-9 h-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className={`input text-sm flex-1 font-mono ${formErrors.primaryColor ? "border-red-300" : ""}`}
                      />
                    </div>
                    {formErrors.primaryColor && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.primaryColor}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedTemplate && (
                <>
                  <div>
                    <p className="section-label mb-3">AI Features</p>
                    <div className="space-y-2">
                      {selectedTemplate.mlFeatures.map((f) => (
                        <div key={f} className="flex items-start gap-2 text-xs text-zinc-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="section-label mb-3">Sections</p>
                    <div className="space-y-1.5">
                      {selectedTemplate.sections.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="w-4 h-4 rounded-md bg-zinc-100 flex items-center justify-center text-[9px] font-semibold text-zinc-400">
                            {i + 1}
                          </span>
                          <span className="capitalize">{s.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {build && (
                <div>
                  <p className="section-label mb-3">Build Status</p>
                  <BuildStatusPanel build={build} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
