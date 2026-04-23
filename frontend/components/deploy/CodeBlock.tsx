import { useState } from "react";
import { Code2, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function CodeBlock({ project, fw, primary, accent, bg, inputs, scatterTarget }: any) {
  const [copied, setCopied] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const genStreamlit = () => `import streamlit as st
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
from datetime import datetime

st.set_page_config(page_title="${project?.projectName}", layout="wide")

st.markdown("""<style>
.stApp { background-color: ${bg}; }
.prediction-card { border: 2px dashed ${primary}; border-radius: 1rem; padding: 2rem; text-align: center; background: white; }
</style>""", unsafe_allow_html=True)

@st.cache_resource
def load_model():
    return joblib.load("model_${project?.id}.joblib")

model = load_model()
if "history" not in st.session_state: st.session_state.history = []

st.title("${project?.projectName}")
tab1, tab2, tab3 = st.tabs(["EDA", "INFERENCE", "TELEMETRY"])

with tab1:
    if os.path.exists("dataset.csv"):
        df = pd.read_csv("dataset.csv")
        st.markdown("### Descriptive Statistics")
        st.dataframe(df.describe())

        st.markdown("### Feature Distributions")
        num_cols = df.select_dtypes(include=np.number).columns
        cols = st.columns(2)
        for i, col in enumerate(num_cols):
            with cols[i % 2]:
                fig, ax = plt.subplots(figsize=(5, 3))
                ax.hist(df[col].dropna(), bins=10, color="${primary}", edgecolor="white")
                ax.set_title(col)
                st.pyplot(fig)

        st.markdown("### Correlation Analysis (Y: ${scatterTarget})")
        target = "${scatterTarget}"
        feat_cols = [${inputs.map((i: any) => `"${i.name}"`).join(", ")}]
        cols_reg = st.columns(2)
        for i, col in enumerate([c for c in feat_cols if c in df.columns and c != target]):
            with cols_reg[i % 2]:
                fig, ax = plt.subplots(figsize=(5, 3))
                ax.scatter(df[col], df[target], color="${accent}", alpha=0.6)
                m, b = np.polyfit(df[col], df[target], 1)
                ax.plot(df[col], m*df[col] + b, color="${primary}")
                ax.set_title(f"{col} (X) vs {target} (Y)")
                st.pyplot(fig)
    else:
        st.error("dataset.csv not found.")

with tab2:
    cl, cr = st.columns(2)
    with cl:
        st.markdown("### Feature Inputs")
        with st.form("input_form"):
            payload = {}
${inputs.map((i: any) => `            payload["${i.name}"] = st.number_input("${i.name}", value=0.0)`).join("\n")}
            if st.form_submit_button("Execute Inference Command"):
                res = model.predict(pd.DataFrame([payload]))[0]
                st.session_state.history.append({"time": datetime.now().strftime("%H:%M:%S"), "output": float(res)})
                st.session_state.last_prediction = float(res)
    with cr:
        st.markdown("### Inference Result")
        if "last_prediction" in st.session_state:
            st.markdown(f'''<div class="prediction-card">
                <p style="color:#888; font-size:10px; font-weight:bold; text-transform:uppercase;">Engine Output</p>
                <h1 style="color:${primary}; font-size:48px; font-weight:900;">{st.session_state.last_prediction:.4f}</h1>
            </div>''', unsafe_allow_html=True)
        else:
            st.info("Awaiting input data.")

with tab3:
    st.markdown("### Session Analytics")
    if st.session_state.history:
        h_df = pd.DataFrame(st.session_state.history)
        st.line_chart(h_df.set_index("time"))
        st.table(h_df.tail(10))
`;

  const genGradio = () => `import gradio as gr
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io
from PIL import Image

model = joblib.load("model_${project?.id}.joblib")
history = []

def predict_fn(${inputs.map((i: any) => i.name).join(", ")}):
    df = pd.DataFrame([{${inputs.map((i: any) => `"${i.name}": ${i.name}`).join(", ")}}])
    res = float(model.predict(df)[0])
    history.append(res)
    fig, ax = plt.subplots(figsize=(5, 2))
    ax.plot(history, color="${primary}", marker="o")
    ax.set_title("Prediction Telemetry")
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
    return str(round(res, 4)), Image.open(buf)

with gr.Blocks(title="${project?.projectName}") as demo:
    gr.Markdown("# ${project?.projectName}")
    with gr.Tabs():
        with gr.TabItem("Inference"):
            with gr.Row():
                with gr.Column():
${inputs.map((i: any) => `                    ${i.name} = gr.Number(label="${i.name}")`).join("\n")}
                    btn = gr.Button("Execute", variant="primary")
                with gr.Column():
                    out = gr.Textbox(label="Result")
                    plot = gr.Image(label="Telemetry")
            btn.click(predict_fn, [${inputs.map((i: any) => i.name).join(", ")}], [out, plot])
demo.launch()
`;

  const code = fw === "streamlit" ? genStreamlit() : genGradio();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 rounded-[2rem] shadow-xl overflow-hidden border border-zinc-800">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-zinc-900/50">
        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" /> Source Code / app.py
        </p>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2 bg-white/10 rounded-lg text-[10px] font-black text-white hover:bg-white/20 transition-all">
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "COPIED" : "COPY CODE"}
        </button>
      </div>
      <div className="relative">
        <pre className={`p-6 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap transition-all duration-500 ${showFull ? "" : "max-h-[300px] overflow-hidden"}`}>
          {code}
        </pre>
        {!showFull && <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />}
      </div>
      <button onClick={() => setShowFull(!showFull)} className="w-full py-4 text-[10px] font-black text-zinc-400 hover:text-white transition-all bg-white/5 uppercase tracking-widest">
        {showFull ? "Collapse View" : "Expand Complete Source Code"}
      </button>
    </div>
  );
}