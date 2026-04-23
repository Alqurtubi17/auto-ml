"use client";

import { useState } from "react";
import { BookOpen, Zap, GraduationCap, PlayCircle, Lock, ChevronDown, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const DOCS_DATA = [
  {
    id: "getting-started",
    category: "Getting Started",
    description: "Learn the basics and set up your workspace.",
    icon: Zap,
    items: [
      {
        id: "what-is",
        title: "What is LarikAI?",
        content: "Think of AI as a Smart Chef, and your data table (Excel/CSV) as the Ingredients. In the past, you had to write a recipe (code) line by line so the Chef knew how to cook. But with Automated Machine Learning, you just hand over the ingredients and tell the Chef what dish you want. Our system automatically tries thousands of different recipes, tastes them, and serves you the best possible AI Model."
      },
      {
        id: "connect-data",
        title: "How to connect your data",
        content: "To get started, prepare your data in CSV format. Make sure the first row contains simple column names like 'Age' or 'Income'. Then, click 'New Project' and upload your file. Our system will automatically read these columns and figure out what information can be used to predict your main target."
      },
      {
        id: "read-dashboard",
        title: "Reading the dashboard",
        content: "Once your data is uploaded, you will see a summary showing averages, highs, and lows for each column. We also provide simple charts. This helps you understand if your data has any weird spikes or missing information before the AI starts learning from it."
      }
    ]
  },
  {
    id: "training-ai",
    category: "Training Your AI",
    description: "Teach your machine how to recognize patterns.",
    icon: GraduationCap,
    items: [
      {
        id: "how-ai-learns",
        title: "How AI learns from data",
        content: "It is like teaching a child to tell cats and dogs apart by showing them lots of photos. The AI looks for patterns in your historical data. If you upload sales data, the AI figures out which factors, like discounts or the day of the week, affect your sales the most."
      },
      {
        id: "fix-messy-data",
        title: "Fixing messy data automatically",
        content: "Real-world data is rarely perfect and often has empty cells. Our engine has automatic features to handle this. We can fill those empty cells with the column's average value so the AI can still learn without losing important context."
      },
      {
        id: "accuracy-scores",
        title: "Understanding accuracy scores",
        content: "After learning, the AI takes a test using data it has never seen before. If it guesses correctly 95 out of 100 times, its Accuracy is 95%. A higher percentage means a smarter, more reliable model. We do the complex math behind the scenes so you only see the final score."
      }
    ]
  },
  {
    id: "making-predictions",
    category: "Making Predictions",
    description: "Put your smart AI to work in real-time.",
    icon: PlayCircle,
    items: [
      {
        id: "execute-inference",
        title: "Using the Execute button",
        content: "Go to the 'Active Deployments' console. You will see a simple form. Enter the current situation's data—like today's temperature or marketing budget—then click 'Execute'. The AI will process this and output its best prediction in milliseconds."
      },
      {
        id: "read-charts",
        title: "Reading charts and trends",
        content: "Every prediction is logged in the Telemetry tab. Here, you will see a simple line chart showing prediction trends over time. This helps you see the bigger picture visually instead of staring at boring tables of numbers."
      }
    ]
  },
  {
    id: "data-privacy",
    category: "Data Privacy & Security",
    description: "How we protect your company secrets.",
    icon: Lock,
    items: [
      {
        id: "where-is-data",
        title: "Where is your data stored?",
        content: "When you upload data, it is processed temporarily in our server's short-term memory (RAM) just to teach the AI, and then permanently deleted. We only keep the 'Brain' of your AI, never your raw data or company secrets."
      },
      {
        id: "bank-security",
        title: "Bank-grade security systems",
        content: "All communication is encrypted using modern protocols. Additionally, your 'AI Brains' are locked in our digital vault using military-grade AES-256 encryption. Even if someone breached our servers, they could not read or use your AI."
      }
    ]
  }
];

export default function DocsPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(DOCS_DATA[0].id);
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const handleFeedback = () => {
    toast.success(`Thank you! Your feedback helps us improve.`);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 animate-in fade-in duration-700 pb-20 pt-4">
      
      <header className="flex flex-col items-center text-center gap-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest border border-emerald-100 shadow-sm">
           <BookOpen className="w-4 h-4" /> Official Guides
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-zinc-800 tracking-tight">
          Help Center & Guides
        </h1>
        <p className="text-zinc-500 text-base font-medium max-w-xl leading-relaxed">
          We turn complex Data Science into simple clicks. Explore our layman-friendly guides below to master your automated AI workspace.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {DOCS_DATA.map((category) => {
          const isCategoryOpen = openCategory === category.id;

          return (
            <div 
              key={category.id} 
              className={`bg-white border rounded-[1.5rem] transition-all duration-500 shadow-sm ${
                isCategoryOpen ? "border-emerald-200" : "border-zinc-200 hover:border-emerald-300"
              }`}
            >
              <button 
                onClick={() => setOpenCategory(isCategoryOpen ? null : category.id)}
                className="w-full flex items-center justify-between p-6 bg-transparent relative cursor-pointer"
              >
                <div className="flex items-center gap-5 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                    isCategoryOpen ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-zinc-50 text-emerald-500 border border-zinc-100"
                  }`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black text-zinc-800 tracking-tight">{category.category}</h2>
                    <p className="text-sm font-medium text-zinc-500">{category.description}</p>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-500 ${
                  isCategoryOpen ? "bg-emerald-50 text-emerald-600 rotate-180" : "bg-zinc-50 text-zinc-400"
                }`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <div className={`grid transition-all duration-500 ease-in-out ${isCategoryOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 pt-2 flex flex-col gap-3">
                    {category.items.map((article) => {
                      const isArticleOpen = openArticle === article.id;

                      return (
                        <div 
                          key={article.id} 
                          className={`bg-zinc-50/50 rounded-xl border transition-all duration-300 ${
                            isArticleOpen ? "border-emerald-200 shadow-sm" : "border-zinc-100 hover:border-emerald-200"
                          }`}
                        >
                          <button 
                            onClick={() => setOpenArticle(isArticleOpen ? null : article.id)}
                            className="w-full flex items-center justify-between p-5 text-left"
                          >
                            <span className={`text-sm font-bold transition-colors ${isArticleOpen ? "text-emerald-700" : "text-zinc-700"}`}>
                              {article.title}
                            </span>
                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isArticleOpen ? "rotate-90 text-emerald-500" : "text-zinc-300"}`} />
                          </button>

                          <div className={`grid transition-all duration-500 ease-in-out ${isArticleOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                            <div className="overflow-hidden">
                              <div className="px-5 pb-5 flex flex-col gap-5">
                                <div className="w-full h-px bg-zinc-200/60" />
                                <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                                  {article.content}
                                </p>
                                
                                <div className="pt-5 border-t border-zinc-200/60 flex flex-col gap-3">
                                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">
                                    Was this article helpful?
                                  </span>
                                  <div className="flex flex-col gap-2">
                                    <button 
                                      onClick={handleFeedback}
                                      className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold transition-all"
                                    >
                                      <ThumbsUp className="w-4 h-4" /> Helpful
                                    </button>
                                    <button 
                                      onClick={handleFeedback}
                                      className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 text-zinc-500 rounded-xl text-sm font-bold transition-all"
                                    >
                                      <ThumbsDown className="w-4 h-4" /> Not Helpful
                                    </button>
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

      <div className="bg-emerald-600 rounded-[1.5rem] p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-emerald-600/20 relative overflow-hidden mt-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-3xl opacity-40 -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-30 -ml-20 -mb-20 pointer-events-none" />
        
        <BookOpen className="w-10 h-10 text-white opacity-90 relative z-10" />
        <div className="flex flex-col gap-2 relative z-10 max-w-md">
          <h2 className="text-2xl font-black text-white tracking-tight">Advanced Systems Support</h2>
          <p className="text-emerald-100 text-sm font-medium leading-relaxed">
            Our support engineers are ready to help with custom integrations and system scaling.
          </p>
        </div>
        <a 
          href="mailto:solutionist1226@gmail.com"
          className="relative z-10 inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-white text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          Contact Support Team
        </a>
      </div>

    </div>
  );
}