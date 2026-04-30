"use client";

import { useState } from "react";
import { Layers, LayoutDashboard, ChevronDown, ThumbsUp, ThumbsDown, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "sonner";

const DOCS_DATA = [
  {
    id: "getting-started",
    category: "Pipeline Overview",
    description: "Understand how your data moves through the system.",
    icon: Layers,
    items: [
      { id: "uploading-data", title: "Uploading Your Dataset", content: "Start by uploading a clean CSV file. Ensure your first row contains the column headers. Our system will parse the file and ask you to select which column is your 'Target' (the value you want the AI to predict)." },
      { id: "preprocessing-logic", title: "How Preprocessing Works", content: "If your data has blank cells, we fill them using the mean or median for numbers, and the most frequent value for text. Text categories like 'Yes/No' or 'Red/Blue' are automatically converted into numbers (encoded) so the machine learning algorithms can process them." }
    ]
  },
  {
    id: "deployment",
    category: "Web App Output",
    description: "Running your model in Streamlit or Gradio.",
    icon: LayoutDashboard,
    items: [
      { id: "using-streamlit", title: "Deploying to Streamlit", content: "Once training is complete, simply click 'Launch Streamlit'. We generate a dynamic web form based on your input features. You can enter new values into the form and get instant predictions from your trained model." },
      { id: "download-code", title: "Downloading the Scripts", content: "Want to host it yourself? You can download the 'app.py' file along with your 'model.pkl'. Just run 'pip install streamlit' and 'streamlit run app.py' on your local machine to launch the exact same interface." }
    ]
  }
];

export default function DocsAccordion() {
  const [openCategory, setOpenCategory] = useState<string | null>(DOCS_DATA[0].id);
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const handleFeedback = () => toast.success(`Thank you! Your feedback helps us improve.`);

  return (
    <section id="documentation" className="w-full bg-transparent py-32 md:py-40">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col gap-16">
        <header className="flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-black uppercase tracking-widest shadow-sm">
            <BookOpen className="w-4 h-4 text-emerald-600" /> Official Guides
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter">How It Works</h2>
          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">Step-by-step documentation on how to take your project from a raw CSV file to a fully interactive application.</p>
        </header>
        <div className="flex flex-col gap-6">
          {DOCS_DATA.map((category) => {
            const isCategoryOpen = openCategory === category.id;
            return (
              <div key={category.id} className={`bg-white border rounded-[2rem] transition-all duration-500 shadow-sm ${isCategoryOpen ? "border-emerald-300 shadow-emerald-500/5" : "border-zinc-200 hover:border-emerald-300"}`}>
                <button onClick={() => setOpenCategory(isCategoryOpen ? null : category.id)} className="w-full flex items-center justify-between p-8 bg-transparent relative cursor-pointer">
                  <div className="flex items-center gap-6 text-left">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isCategoryOpen ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-zinc-50 text-emerald-600 border border-zinc-100"}`}>
                      <category.icon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{category.category}</h3>
                      <p className="text-base font-medium text-zinc-500">{category.description}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-500 ${isCategoryOpen ? "bg-emerald-50 text-emerald-600 rotate-180" : "bg-zinc-50 text-zinc-400"}`}>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${isCategoryOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="px-8 pb-8 flex flex-col gap-4">
                      {category.items.map((article) => {
                        const isArticleOpen = openArticle === article.id;
                        return (
                          <div key={article.id} className={`bg-zinc-50/80 rounded-2xl border transition-all duration-300 ${isArticleOpen ? "border-emerald-300 shadow-sm bg-white" : "border-zinc-200 hover:border-emerald-300"}`}>
                            <button onClick={() => setOpenArticle(isArticleOpen ? null : article.id)} className="w-full flex items-center justify-between p-6 text-left">
                              <span className={`text-lg font-black transition-colors ${isArticleOpen ? "text-emerald-700" : "text-zinc-800"}`}>{article.title}</span>
                              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isArticleOpen ? "rotate-90 text-emerald-500" : "text-zinc-400"}`} />
                            </button>
                            <div className={`grid transition-all duration-500 ease-in-out ${isArticleOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                              <div className="overflow-hidden">
                                <div className="px-6 pb-6 flex flex-col gap-6">
                                  <div className="w-full h-px bg-zinc-200" />
                                  <p className="text-zinc-600 text-base leading-relaxed font-medium">{article.content}</p>
                                  <div className="pt-6 border-t border-zinc-200 flex flex-col gap-4">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center">Was this article helpful?</span>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                      <button onClick={handleFeedback} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold transition-all shadow-sm w-full sm:w-40"><ThumbsUp className="w-4 h-4" /> Helpful</button>
                                      <button onClick={handleFeedback} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-zinc-500 rounded-xl text-sm font-bold transition-all shadow-sm w-full sm:w-40"><ThumbsDown className="w-4 h-4" /> Not Helpful</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}