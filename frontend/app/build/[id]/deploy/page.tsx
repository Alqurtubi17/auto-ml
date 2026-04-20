"use client";

import { useState } from "react";
import { useBuildStatus } from "@/hooks/useBuildStatus";
import { ArrowLeft, LayoutTemplate, Copy, CheckCircle2, Loader2, Download, Trash2, Box, Sparkles, Terminal, ExternalLink, Zap, Gauge, Layers, Palette } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props { params: { id: string } }

export default function DeployPage({ params }: Props) {
  const { build: project, isLoading } = useBuildStatus(params.id);
  const [fw, setFw] = useState<"streamlit" | "gradio" | "fastapi">("streamlit");
  const [copied, setCopied] = useState(false);
  const [mockRun, setMockRun] = useState(false);
  const [mockVal, setMockVal] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);
  const router = useRouter();
  // Custom theme colors — user can pick
  const [primary, setPrimary] = useState("#48435c");
  const [accent, setAccent] = useState("#9792e3");
  const [bg, setBg] = useState("#edffec");
  const [saving, setSaving] = useState(false);

  // Sync state with saved metadata
  useState(() => {
    const theme = (project?.uiSchema as any)?.theme;
    if (theme) {
      if (theme.primary) setPrimary(theme.primary);
      if (theme.accent) setAccent(theme.accent);
      if (theme.bg) setBg(theme.bg);
    }
  });

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await api.builds.updateConfig(params.id, { 
        theme: { primary, accent, bg } 
      });
      toast.success("Theme preference saved!");
    } catch (e) {
      toast.error("Failed to persist theme.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !project) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#61e786] border-t-[#48435c] rounded-full animate-spin" />
    </div>
  );

  const inputs = project.uiSchema?.inputs || [];
  const paramsList = inputs.map((i: any) => i.name).join(', ');
  const featuresDict = inputs.map((i: any) => `"${i.name}": ${i.name}`).join(', ');
  const featureNames = inputs.map((i: any) => `"${i.name}"`).join(', ');
  const pydanticFields = inputs.map((i: any) => `    ${i.name}: float = 0.0`).join('\n');
  const acc = project.accuracy ? (project.accuracy * 100).toFixed(1) : "0.0";
  const lat = project.metrics?.latencyMs || 0;
  const size = project.metrics?.modelSize || "4.2 MB";
  const runCmd = fw === "streamlit" ? "streamlit run app.py" : fw === "fastapi" ? "uvicorn main:app --reload" : "python app.py";

  const genStreamlit = () => `import streamlit as st
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# ── Page Config ──────────────────────────────────────────────
st.set_page_config(page_title="${project.projectName}", layout="wide", page_icon="🚀")

# ── Custom Theme & CSS ───────────────────────────────────────
st.markdown("""<style>
.stApp { background-color: ${bg}; }
.stButton>button { 
    background-color: ${primary}; 
    color: white; 
    border-radius: 8px; 
    border: none; 
    font-weight: 800; 
    letter-spacing: 1px;
    padding: 0.75rem;
    transition: all 0.3s ease;
}
.stButton>button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px ${primary}40; }
.hero-box {
    background: linear-gradient(135deg, ${primary}, ${primary}ee);
    border-radius: 16px;
    padding: 2rem;
    color: white;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px ${primary}30;
}
.hero-title { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem; }
.hero-subtitle { font-size: 1.1rem; opacity: 0.9; font-weight: 500; }
.metric-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 4px solid ${accent};
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
</style>""", unsafe_allow_html=True)

# ── Model Loading ─────────────────────────────────────────────
@st.cache_resource
def load_model():
    return joblib.load("model_${project.id}.joblib")

model = load_model()

# ── Session State ────────────────────────────────────────────
if "history" not in st.session_state:
    st.session_state.history = []

# ── Hero Section ──────────────────────────────────────────────
st.markdown(f"""
<div class="hero-box">
    <div class="hero-title">🚀 { "${project.projectName}" }</div>
    <div class="hero-subtitle">Automated Machine Learning Inference Engine</div>
    <div style="margin-top: 1rem; display: flex; gap: 1rem;">
        <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">Task: ${String(project.taskType || 'unknown').toUpperCase()}</span>
        <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">Accuracy: ${acc}%</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ── Layout ────────────────────────────────────────────────────
col1, col2 = st.columns([5, 7], gap="large")

with col1:
    st.markdown("### 🎛️ Feature Inputs")
    st.markdown("<p style='font-size: 0.9rem; color: #666;'>Configure the parameters below to generate a prediction.</p>", unsafe_allow_html=True)
    
    with st.form("prediction_form"):
        vals = {}
${inputs.map((i: any) => `        vals["${i.name}"] = st.number_input("${i.label || i.name}", value=0.0, format="%.4f")`).join('\n')}
        
        submitted = st.form_submit_button("⚡ EXECUTE INFERENCE", use_container_width=True)
        
        if submitted:
            with st.spinner("Processing data through model pipeline..."):
                df = pd.DataFrame([vals])
                prediction = model.predict(df)
                result = prediction[0]
                
                st.session_state.history.append({
                    "time": datetime.now().strftime("%H:%M:%S"),
                    "input_hash": hash(str(list(vals.values()))),
                    "output": float(result)
                })
                st.session_state.last_result = float(result)

with col2:
    st.markdown("### 🎯 Inference Result")
    
    if "last_result" in st.session_state:
        st.markdown(f"""
        <div style="background: white; border: 2px dashed ${primary}; border-radius: 16px; padding: 2rem; text-align: center; margin-bottom: 2rem;">
            <p style="color: #666; font-size: 1rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Engine Output</p>
            <h1 style="color: ${primary}; font-size: 4rem; font-weight: 900; margin: 0;">{st.session_state.last_result:.4f}</h1>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.info("Awaiting input data. Click 'Execute Inference' to begin.")

    st.markdown("### 📊 Engine Telemetry")
    c1, c2, c3 = st.columns(3)
    c1.metric("Model Precision", "${acc}%", "Optimized")
    c2.metric("Inference Latency", "${lat}ms", "P99")
    c3.metric("Feature Space", "${inputs.length} Dims", "Active")

# ── Analytics Section ─────────────────────────────────────────
if st.session_state.history:
    st.markdown("---")
    st.markdown("### 📈 Session Analytics")
    
    col_chart, col_table = st.columns([2, 1])
    
    with col_chart:
        fig, ax = plt.subplots(figsize=(10, 4))
        ax.plot([h["output"] for h in st.session_state.history], 
                color="${accent}", linewidth=3, marker="o", markersize=8, markerfacecolor="${primary}")
        ax.set_ylabel("Prediction Value", fontweight="bold")
        ax.set_title("Inference Trend Over Time", fontweight="bold", pad=15)
        ax.grid(True, linestyle="--", alpha=0.5)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        st.pyplot(fig)
        
    with col_table:
        hist_df = pd.DataFrame(st.session_state.history)
        st.dataframe(hist_df[["time", "output"]].tail(5), use_container_width=True, hide_index=True)
        if st.button("🗑️ Purge Session Memory"):
            st.session_state.history = []
            st.rerun()`;

  const genGradio = () => `import gradio as gr
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io
from PIL import Image

model = joblib.load("model_${project.id}.joblib")
history = []

def predict(${paramsList}):
    data = pd.DataFrame([{${featuresDict}}])
    result = model.predict(data)[0]
    history.append(float(result))

    # Build trend chart
    fig, ax = plt.subplots(figsize=(5, 2))
    ax.plot(history, color="${primary}", linewidth=2, marker="o")
    ax.set_title("Prediction Trend", fontsize=9)
    ax.grid(True, alpha=0.3)
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    chart = Image.open(buf)
    plt.close(fig)

    stats = f"Runs: {len(history)} | Min: {min(history):.3f} | Max: {max(history):.3f} | Avg: {sum(history)/len(history):.3f}"
    return str(round(float(result), 4)), stats, chart

with gr.Blocks(title="${project.projectName}") as demo:
    gr.Markdown(f"# 🤖 ${project.projectName}")
    gr.Markdown("**Task:** ${project.taskType} | **Accuracy:** ${acc}% | **Latency:** ${lat}ms")
    with gr.Row():
        with gr.Column():
            gr.Markdown("### 📋 Input Parameters")
${inputs.map((i: any) => `            ${i.name} = gr.Number(label="${i.label || i.name}", value=0)`).join('\n')}
            btn = gr.Button("⚡ Predict", variant="primary")
        with gr.Column():
            gr.Markdown("### 📊 Output")
            out = gr.Textbox(label="Prediction Result")
            stats_out = gr.Textbox(label="Session Statistics")
    chart_out = gr.Image(label="Prediction Trend")
    btn.click(predict, inputs=[${paramsList}], outputs=[out, stats_out, chart_out])

demo.launch(share=False)`;

  const genFastApi = () => `from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
import joblib
import pandas as pd
from datetime import datetime
from collections import deque
import time

# ── API Metadata ─────────────────────────────────────────────
tags_metadata = [
    {"name": "Inference Engine", "description": "Execute predictions using the deployed AutoML model."},
    {"name": "Telemetry", "description": "Retrieve session statistics and prediction history."}
]

app = FastAPI(
    title="🚀 ${project.projectName} API",
    description="High-performance prediction engine generated by AutoML Studio.",
    version="1.0.0",
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# ── Global State ─────────────────────────────────────────────
print("Loading model artifacts...")
model = joblib.load("model_${project.id}.joblib")
prediction_log: deque = deque(maxlen=500)
START_TIME = time.time()

# ── Schemas ──────────────────────────────────────────────────
class InputData(BaseModel):
${inputs.map((i: any) => `    ${i.name}: float = Field(default=0.0, description="${i.label || i.name}")`).join('\n')}

class PredictionResponse(BaseModel):
    prediction: float
    model_version: str
    latency_ms: float
    timestamp: str

# ── Endpoints ────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse, tags=["System"])
def root():
    uptime = round(time.time() - START_TIME, 2)
    return f"""
    <html>
        <head>
            <title>${project.projectName} API</title>
            <style>
                body {{ font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
                .card {{ background: #1e293b; padding: 3rem; border-radius: 16px; border-top: 4px solid #38bdf8; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; max-width: 500px; }}
                h1 {{ color: #38bdf8; margin-top: 0; font-size: 2.5rem; }}
                .tag {{ display: inline-block; background: #334155; padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: bold; margin: 4px; }}
                .btn {{ display: inline-block; margin-top: 2rem; background: #38bdf8; color: #0f172a; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; transition: opacity 0.2s; }}
                .btn:hover {{ opacity: 0.9; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h1>⚡ Engine Online</h1>
                <p style="opacity: 0.8; margin-bottom: 2rem;">AutoML Predictive Pipeline is actively serving requests.</p>
                <div>
                    <span class="tag">Task: ${String(project.taskType || 'unknown').toUpperCase()}</span>
                    <span class="tag">Accuracy: ${acc}%</span>
                    <span class="tag">Uptime: {uptime}s</span>
                </div>
                <a href="/docs" class="btn">View API Documentation ➔</a>
            </div>
        </body>
    </html>
    """

@app.post("/predict", response_model=PredictionResponse, tags=["Inference Engine"])
def predict(data: InputData):
    """
    Execute a single prediction against the loaded model.
    Pass a JSON object containing the required feature fields.
    """
    start_t = time.time()
    try:
        df = pd.DataFrame([data.dict()])
        result = float(model.predict(df)[0])
        exec_time_ms = round((time.time() - start_t) * 1000, 2)
        
        record = {
            "prediction": result, 
            "latency_ms": exec_time_ms,
            "timestamp": datetime.now().isoformat()
        }
        prediction_log.append(record)
        
        return PredictionResponse(
            prediction=result,
            model_version="1.0.0",
            latency_ms=exec_time_ms,
            timestamp=record["timestamp"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failure: {str(e)}")

@app.get("/telemetry", tags=["Telemetry"])
def telemetry():
    """
    Retrieve real-time operational statistics of the engine.
    """
    preds = [r["prediction"] for r in prediction_log]
    lats = [r["latency_ms"] for r in prediction_log]
    if not preds:
        return {"status": "Awaiting traffic", "total_runs": 0}
    return {
        "status": "Active",
        "total_runs": len(preds),
        "prediction_stats": {
            "min": min(preds),
            "max": max(preds),
            "mean": round(sum(preds) / len(preds), 4)
        },
        "performance": {
            "avg_latency_ms": round(sum(lats) / len(lats), 2),
            "max_latency_ms": max(lats)
        }
    }

@app.delete("/telemetry/purge", tags=["Telemetry"])
def purge_telemetry():
    """Clear all session memory and logs."""
    prediction_log.clear()
    return {"message": "Telemetry buffer purged successfully"}`;

  const genCode = () => fw === "streamlit" ? genStreamlit() : fw === "gradio" ? genGradio() : genFastApi();
  const fileName = fw === "fastapi" ? "main.py" : "app.py";

  const copyCode = () => { navigator.clipboard.writeText(genCode()); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000); };
  const dlFile = () => { const b = new Blob([genCode()], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = fileName; a.click(); URL.revokeObjectURL(u); toast.success(`${fileName} downloaded`); };
  const runMock = () => { setMockRun(true); setMockVal(null); setTimeout(() => { setMockRun(false); setMockVal((Math.random() * 100).toFixed(4)); toast.success("Preview inference done!"); }, 800); };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <Link href={`/build/${project.id}`} className="flex items-center gap-2 text-[#48435c]/50 hover:text-[#48435c] text-xs font-bold transition-all group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => toast('Delete build?', { action: { label: 'Delete', onClick: () => api.builds.delete(project.id).then(() => router.push("/history")) } })} className="p-2 text-[#5a5766]/60 hover:text-[#5a5766] hover:bg-[#5a5766]/5 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-[#61e786] text-[#48435c] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#9792e3]/20 flex items-center gap-1.5">
            <LayoutTemplate className="w-3 h-3" /> Web Builder
          </span>
        </div>
      </div>

      <header>
        <h1 className="text-title text-2xl">Deployment Console</h1>
        <p className="text-body text-sm opacity-50">Generate a production-ready {fw} app with stats, history & charts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Settings */}
        <div className="lg:col-span-4 space-y-5">

          {/* Framework */}
          <div className="bg-white border border-[#48435c]/8 p-5 rounded-[1.75rem] shadow-sm space-y-4">
            <p className="text-label">Framework</p>
            <div className="flex flex-col gap-2">
              {(["streamlit", "gradio", "fastapi"] as const).map(f => (
                <button key={f} onClick={() => setFw(f)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-tight transition-all text-left ${fw === f ? "border-[#9792e3] bg-[#61e786]/30 text-[#48435c]" : "border-[#48435c]/5 text-[#48435c]/40 hover:border-[#48435c]/20"}`}>
                  <span className={`w-2 h-2 rounded-full ${fw === f ? "bg-[#9792e3]" : "bg-[#48435c]/10"}`} />
                  {f === "fastapi" ? "FastAPI (REST API)" : f === "gradio" ? "Gradio (Interactive UI)" : "Streamlit (Data App)"}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme */}
          <div className="bg-white border border-[#48435c]/8 p-5 rounded-[1.75rem] shadow-sm space-y-4">
            <p className="text-label flex items-center gap-2"><Palette className="w-3.5 h-3.5" /> Custom Theme</p>
            <div className="space-y-3">
              {[
                { label: "Primary Color", val: primary, set: setPrimary },
                { label: "Accent Color", val: accent, set: setAccent },
                { label: "Background", val: bg, set: setBg },
              ].map(c => (
                <div key={c.label} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#48435c]/50">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#48435c]/30">{c.val}</span>
                    <label className="relative cursor-pointer">
                      <input type="color" value={c.val} onChange={e => c.set(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      <div className="w-7 h-7 rounded-lg border-2 border-[#48435c]/10 shadow-inner" style={{ backgroundColor: c.val }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {/* Preview swatch */}
            {/* Preview swatch */}
            <div className="p-3 rounded-xl border border-[#48435c]/5 space-y-2" style={{ backgroundColor: bg }}>
              <p className="text-[10px] font-black uppercase" style={{ color: primary }}>Preview</p>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-lg text-[9px] font-black text-white" style={{ backgroundColor: primary }}>Button</div>
                <div className="px-3 py-1.5 rounded-lg text-[9px] font-black text-white" style={{ backgroundColor: accent }}>Accent</div>
              </div>
            </div>

            <button 
              onClick={handleSaveTheme} disabled={saving}
              className="w-full py-2.5 rounded-xl border border-[#48435c]/10 text-[10px] font-black uppercase tracking-widest hover:bg-[#61e786] transition-all flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Box className="w-3 h-3" />}
              {saving ? "Saving..." : "Save as Default Theme"}
            </button>
          </div>

          {/* Run Locally */}
          <div className="bg-white border border-[#48435c]/8 p-5 rounded-[1.75rem] shadow-sm space-y-4">
            <p className="text-label flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Local Setup Guide</p>
            <div className="space-y-3 text-[10px] font-mono">
              {[
                { step: "1. Create venv", cmds: ["python -m venv venv"] },
                { step: "2. Activate", cmds: [".\\venv\\Scripts\\activate", "# Mac/Linux:", "source venv/bin/activate"] },
                { step: "3. Install deps", cmds: [`pip install ${fw === "streamlit" ? "streamlit joblib pandas numpy matplotlib" : fw === "gradio" ? "gradio joblib pandas matplotlib pillow" : "fastapi uvicorn joblib pandas numpy"}`] },
                { step: "4. Run app", cmds: [runCmd] },
              ].map(s => (
                <div key={s.step} className="space-y-1">
                  <p className="text-[9px] font-black text-[#9792e3] uppercase tracking-widest">{s.step}</p>
                  <div className="bg-[#48435c]/5 border border-[#48435c]/5 p-2.5 rounded-xl space-y-0.5">
                    {s.cmds.map((c, i) => <p key={i} className="text-[#48435c]/60">{c}</p>)}
                  </div>
                </div>
              ))}
            </div>
            <a href="https://www.python.org/downloads/release/python-3110/" target="_blank"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#61e786] text-[#48435c] text-[10px] font-black hover:opacity-90 transition-all border border-[#9792e3]/20">
              Download Python 3.11 <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* RIGHT: Preview + Code */}
        <div className="lg:col-span-8 space-y-5">

          {/* Framework Mockup Preview */}
          <div className="bg-white border border-[#48435c]/8 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#48435c]/5 flex items-center justify-between" style={{ backgroundColor: `${primary}08` }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5a5766]/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9792e3]/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#48435c]/20" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: primary }}>
                  {fw === 'streamlit' ? '🟥 Streamlit' : fw === 'gradio' ? '🟧 Gradio' : '⚡ FastAPI'} Mockup
                </span>
              </div>
              <span className="text-[8px] font-black bg-[#9792e3]/10 text-[#9792e3] px-2 py-0.5 rounded-lg uppercase tracking-widest">Preview Only</span>
            </div>

            {/* Streamlit Mockup */}
            {fw === 'streamlit' && (
              <div className="p-5 space-y-4" style={{ borderTop: `3px solid ${primary}`, backgroundColor: `${bg}` }}>
                <div>
                  <h2 className="text-lg font-black" style={{ color: primary }}>🤖 {project.projectName}</h2>
                  <p className="text-[10px] opacity-50" style={{ color: primary }}>Powered by AutoML Studio · {project.taskType} · {acc}% accuracy</p>
                </div>
                <div className="flex gap-2 border-b border-[#48435c]/5 pb-3">
                  {['Prediction', 'Info'].map(t => (
                    <span key={t} className="px-3 py-1 rounded-lg text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: t === 'Prediction' ? primary : `${primary}30`, color: t === 'Prediction' ? 'white' : primary }}>{t}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {inputs.slice(0, 3).map((i: any) => (
                    <div key={i.name} className="space-y-1">
                      <p className="text-[9px] font-bold" style={{ color: primary }}>{i.label || i.name}</p>
                      <div className="h-8 bg-white border border-[#48435c]/10 rounded-lg" />
                    </div>
                  ))}
                </div>
                <button className="px-4 py-2 rounded-lg text-white text-[10px] font-black shadow" style={{ backgroundColor: primary }}>⚡ Predict</button>
                <div className="p-4 bg-white border border-[#48435c]/5 rounded-xl text-center">
                  <p className="text-[8px] font-black text-[#48435c]/30 uppercase mb-1">Result</p>
                  <p className="text-2xl font-black" style={{ color: primary }}>—</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[['Accuracy', acc+'%'], ['Latency', lat+'ms'], ['Storage', size]].map(([l,v]) => (
                    <div key={l} className="p-2 bg-white border border-[#48435c]/5 rounded-lg text-center">
                      <p className="text-[7px] text-[#48435c]/30 font-black uppercase">{l}</p>
                      <p className="text-xs font-black" style={{ color: primary }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gradio Mockup */}
            {fw === 'gradio' && (
              <div className="p-5 space-y-4" style={{ backgroundColor: bg }}>
                <h2 className="text-base font-black" style={{ color: primary }}>🤖 {project.projectName}</h2>
                <p className="text-[10px] font-bold opacity-40" style={{ color: primary }}>Task: {project.taskType} | Accuracy: {acc}%</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3 border border-[#48435c]/5 rounded-xl p-4 bg-white">
                    <p className="text-[10px] font-black uppercase" style={{ color: primary }}>📋 Input Parameters</p>
                    {inputs.slice(0, 4).map((i: any) => (
                      <div key={i.name} className="space-y-1">
                        <p className="text-[9px] font-bold text-[#48435c]/40">{i.label || i.name}</p>
                        <div className="h-7 bg-[#f8f8f8] border border-[#48435c]/5 rounded-lg" />
                      </div>
                    ))}
                    <button className="w-full py-1.5 rounded-lg text-white text-[10px] font-black" style={{ backgroundColor: primary }}>⚡ Predict</button>
                  </div>
                  <div className="space-y-3">
                    <div className="border border-[#48435c]/5 rounded-xl p-4 bg-white">
                      <p className="text-[10px] font-black uppercase mb-2" style={{ color: primary }}>📊 Output</p>
                      <div className="h-7 bg-[#f8f8f8] border border-[#48435c]/5 rounded-lg" />
                    </div>
                    <div className="border border-[#48435c]/5 rounded-xl p-4 bg-white">
                      <p className="text-[10px] font-black uppercase mb-2" style={{ color: primary }}>📈 Trend Chart</p>
                      <div className="h-20 bg-[#f8f8f8] rounded-lg flex items-center justify-center text-[9px] text-[#48435c]/20 font-bold">Chart will render here</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FastAPI Mockup */}
            {fw === 'fastapi' && (
              <div className="p-5 space-y-4 font-mono" style={{ backgroundColor: '#1e1e2e' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-emerald-400">⚡ FastAPI</span>
                  <span className="text-[10px] text-white/30">{project.projectName}</span>
                </div>
                {[
                  { method: 'GET', path: '/', color: 'bg-emerald-500', desc: 'Health check' },
                  { method: 'POST', path: '/predict', color: 'bg-[#9792e3]', desc: 'Run prediction → returns result + metadata' },
                  { method: 'GET', path: '/stats', color: 'bg-sky-500', desc: 'Session statistics (min/max/mean/count)' },
                  { method: 'GET', path: '/history', color: 'bg-sky-500', desc: 'Full prediction log (last 100)' },
                  { method: 'DELETE', path: '/history', color: 'bg-red-400', desc: 'Clear prediction log' },
                ].map(e => (
                  <div key={e.path} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5">
                    <span className={`${e.color} text-white text-[8px] font-black px-2 py-0.5 rounded shrink-0 mt-0.5`}>{e.method}</span>
                    <div>
                      <p className="text-[11px] font-black text-white">{e.path}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">{e.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-2 p-3 bg-white/5 rounded-xl text-[9px] text-white/30">
                  Docs: <span className="text-[#9792e3]">http://localhost:8000/docs</span> (Swagger UI auto-generated)
                </div>
              </div>
            )}

            <div className="px-5 py-2.5 bg-[#9792e3]/5 border-t border-[#9792e3]/10 flex items-center gap-2">
              <span className="text-[8px]">⚠️</span>
              <p className="text-[9px] font-bold text-[#9792e3]/70">Ini adalah mockup statis. Download dan jalankan script secara lokal untuk melihat tampilan dan fungsi yang sesungguhnya.</p>
            </div>
          </div>

          {/* Assets Download */}
          <div className="flex gap-3">
            <a href={`/api/v1/builds/${project.id}/model`}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-[#48435c]/10 rounded-xl text-xs font-black text-[#48435c] hover:bg-[#61e786]/30 transition-all shadow-sm">
              <Download className="w-4 h-4" /> model.joblib
            </a>
            <button onClick={dlFile}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#48435c] text-[#61e786] rounded-xl text-xs font-black hover:opacity-90 transition-all shadow-lg">
              <Sparkles className="w-4 h-4" /> Download {fileName}
            </button>
          </div>

          {/* Generated Code — collapsible */}
          <div className="bg-[#48435c] rounded-[2rem] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <p className="text-[10px] font-black text-[#61e786]/50 uppercase tracking-[0.2em]">{fileName} / Generated Script</p>
                <p className="text-[9px] text-[#61e786]/20 mt-0.5 font-bold">
                  {fw === "streamlit" ? "Stats · History · Chart · Multi-tab" :
                   fw === "gradio" ? "Predict · Stats · Chart · Live UI" :
                   "REST · /predict · /stats · /history · CORS"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={copyCode} className="flex items-center gap-1.5 text-[10px] font-black text-[#9792e3] hover:text-[#61e786] transition-all">
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "COPIED!" : "COPY"}
                </button>
              </div>
            </div>
            <div className="relative">
              <pre className={`p-6 text-[11px] font-mono text-[#61e786]/50 leading-relaxed whitespace-pre-wrap break-words transition-all duration-500 ${showFull ? '' : 'max-h-48 overflow-hidden'}`}>
                {genCode()}
              </pre>
              {!showFull && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#48435c] to-transparent" />
              )}
            </div>
            <button
              onClick={() => setShowFull(v => !v)}
              className="w-full py-3 text-[10px] font-black text-[#61e786]/40 hover:text-[#9792e3] transition-all border-t border-white/5 flex items-center justify-center gap-2">
              {showFull ? '▲ Show Less' : '▼ Read More — View Full Script'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
