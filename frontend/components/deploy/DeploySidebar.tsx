import { Palette, Box, Loader2, Terminal, ExternalLink, Layers, Download } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import React, { useRef } from "react";

export default function DeploySidebar({project,fw,setFw,primary,setPrimary,accent,setAccent,bg,setBg,saving,setSaving,dlFile,fileName}: any) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleColorChange = (setter: any, current: string, next: string) => {
    if (current === next) return; 

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setter(next);
    }, 40); 
  };

  const handleSaveTheme = async () => {
    if (!project?.id) return;
    setSaving(true);
    try {
      await api.builds.updateConfig(project.id, {
        theme: { primary, accent, bg }
      });
      toast.success("Theme preference saved");
    } catch (e) {
      toast.error("Failed to persist theme");
    } finally {
      setSaving(false);
    }
  };

  const runCmd = fw === "streamlit"
    ? "streamlit run app.py"
    : "python app.py";

  return (
    <div className="lg:col-span-4 space-y-5">

      {/* Framework */}
      <div className="bg-white border border-zinc-200 p-5 rounded-[1.75rem] shadow-sm space-y-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
          Framework Selection
        </p>

        <div className="flex flex-col gap-2">
          {(["streamlit", "gradio"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFw(f)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-tight transition-all text-left ${
                fw === f
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                  : "border-zinc-100 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                fw === f ? "bg-emerald-500" : "bg-zinc-200"
              }`} />
              {f === "gradio"
                ? "Gradio (Web UI)"
                : "Streamlit (Data App)"}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white border border-zinc-200 p-5 rounded-[1.75rem] shadow-sm space-y-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" /> Theme Configuration
        </p>

        <div className="space-y-3">
          {[
            { label: "Primary Hue", val: primary, set: setPrimary },
            { label: "Accent Tone", val: accent, set: setAccent },
            { label: "Background", val: bg, set: setBg }
          ].map(c => (
            <div key={c.label} className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500">
                {c.label}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  {c.val}
                </span>

                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={c.val}
                    onInput={(e) =>
                      handleColorChange(
                        c.set,
                        c.val,
                        (e.target as HTMLInputElement).value
                      )
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />

                  <div
                    className="w-7 h-7 rounded-lg border-2 border-zinc-100 shadow-sm"
                    style={{ backgroundColor: c.val }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveTheme}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          {saving
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Box className="w-3.5 h-3.5" />
          }
          {saving ? "Persisting..." : "Save Configuration"}
        </button>
      </div>

      {/* Local Deploy */}
      <div className="bg-white border border-zinc-200 p-5 rounded-[1.75rem] shadow-sm space-y-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" /> Local Deployment
        </p>

        <div className="space-y-3 text-[10px] font-mono">
          {[
            { step: "1. Initialize Environment", cmds: ["python -m venv venv"] },
            { step: "2. Activate Environment", cmds: [".\\venv\\Scripts\\activate"] },
            {
              step: "3. Install Dependencies",
              cmds: [
                `pip install ${
                  fw === "streamlit"
                    ? "streamlit joblib pandas numpy matplotlib"
                    : "gradio joblib pandas numpy matplotlib pillow"
                }`
              ]
            },
            { step: "4. Execute Server", cmds: [runCmd] }
          ].map(s => (
            <div key={s.step} className="space-y-1.5">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                {s.step}
              </p>

              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl space-y-1">
                {s.cmds.map((c, i) => (
                  <p key={i} className="text-zinc-600">{c}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://www.python.org/downloads/release/python-3111/"
          target="_blank"
          className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black hover:bg-emerald-100 transition-all border border-emerald-200"
        >
          Ensure Python 3.11 is installed
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Download */}
      <div className="flex gap-3">
        <a
          href={`/api/v1/builds/${project?.id}/model`}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-zinc-200 rounded-[1.25rem] text-xs font-black text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm"
        >
          <Layers className="w-4 h-4" /> Download model
        </a>

        <button
          onClick={dlFile}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white rounded-[1.25rem] text-xs font-black hover:bg-zinc-800 transition-all shadow-lg"
        >
          <Download className="w-4 h-4" /> Export {fileName}
        </button>
      </div>
    </div>
  );
}