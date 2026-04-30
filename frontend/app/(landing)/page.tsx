import Link from "next/link";
import { ArrowRight, PlayCircle, FileUp, Wrench, Cpu, LayoutDashboard, Download, BarChart3, CheckCircle2, FileJson } from "lucide-react";
import { getSystemSettings } from "@/lib/settings";
import ThreeBackground from "@/components/landing/ThreeBackground";
import DocsAccordion from "@/components/landing/DocsAccordion";
import LandingFooter from "@/components/landing/LandingFooter";
import PricingSection from "@/components/landing/PricingSection";
import LarikLogo from "@/components/LarikLogo";

const PIPELINE_STEPS = [
  { icon: FileUp, title: "1. Data Input", description: "Upload your raw dataset via CSV or Excel. Our engine instantly prepares the workspace." },
  { icon: Wrench, title: "2. Auto Preprocessing", description: "We handle imputing missing values, encoding categoricals, and scaling features." },
  { icon: Cpu, title: "3. Model Training", description: "The system trains multiple algorithms and selects the highest-performing model for you." },
  { icon: LayoutDashboard, title: "4. Interactive Output", description: "Instantly generate a ready-to-use Streamlit or Gradio web interface to test predictions." }
];

const PRACTICAL_FEATURES = [
  { icon: Download, title: "Exportable Models", description: "Your models are yours to keep. Download them directly as .pkl or .joblib files." },
  { icon: BarChart3, title: "Exploratory Data Analysis", description: "View distribution charts and correlation matrices of your uploaded dataset." },
  { icon: CheckCircle2, title: "Transparent Metrics", description: "View detailed evaluation metrics including Accuracy, F1-Score, and RMSE." },
  { icon: FileJson, title: "Streamlit & Gradio Ready", description: "We auto-generate the UI scripts so you can showcase your model instantly." },
];

export default async function LandingPage() {
  const settings = await getSystemSettings();
  
  const rawPrice = parseInt(settings?.ENTERPRISE_PRICE || "99000");
  const displayPrice = isNaN(rawPrice) ? "99" : (rawPrice / 1000);
  const adminEmail = settings?.ADMIN_EMAIL || "solutionist1226@gmail.com";

  return (
    <div suppressHydrationWarning className="relative min-h-screen bg-transparent font-sans text-zinc-900 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900">
      <ThreeBackground />

      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-zinc-200/50 h-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          <LarikLogo />
          <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <a href="#pipeline" className="hover:text-zinc-900 transition-colors">Pipeline</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</a>
            <a href="#documentation" className="hover:text-zinc-900 transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 transition-colors hidden md:block">Login</Link>
            <Link href="/login?mode=register" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]">
              Upload Data
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        <section className="w-full max-w-5xl mx-auto px-6 pt-64 pb-48 flex flex-col items-center text-center bg-transparent">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 leading-[0.95] mb-12">
            From raw CSV to <br className="hidden md:block" /> Web App in minutes.
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-3xl leading-relaxed mb-16 px-4">
            Stop writing boilerplate code. Upload your dataset, let our engine handle the preprocessing, and interact with your model via Streamlit instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link href="/login?mode=register" className="px-12 py-5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl flex items-center gap-3 active:scale-[0.98]">
              Start Training <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://youtube.com/watch?v=demo" target="_blank" rel="noreferrer" className="px-12 py-5 bg-white border border-zinc-200 text-zinc-700 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98]">
              <PlayCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" /> Watch Demo
            </a>
          </div>
        </section>

        <section id="pipeline" className="w-full bg-transparent py-40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-32">
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-8 leading-none">A clear, no-nonsense pipeline.</h2>
              <p className="text-zinc-500 font-medium max-w-3xl text-lg md:text-xl">Automated tedious parts of data science. Straight path to a working interface.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PIPELINE_STEPS.map((step, index) => (
                <div key={index} className="p-10 rounded-[2.5rem] bg-white/40 backdrop-blur-md border border-zinc-200 hover:border-emerald-400 transition-all duration-500 group">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-zinc-200 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mb-4 tracking-tight">{step.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection settings={settings} />

        <section id="features" className="w-full bg-transparent py-40">
          <div className="flex flex-col items-center text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-8 leading-none">Practical tools, not buzzwords.</h2>
            <p className="text-zinc-500 font-medium max-w-3xl text-lg md:text-xl">Everything you need to truly use and understand your machine learning model.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:px-8 max-w-7xl mx-auto">
            {PRACTICAL_FEATURES.map((feature, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-10 p-12 rounded-[3rem] bg-white/40 backdrop-blur-md border border-zinc-200 hover:shadow-2xl transition-all duration-700">
                <div className="shrink-0">
                  <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-center">
                    <feature.icon className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>
                <div className="flex flex-col pt-2">
                  <h3 className="text-2xl font-black text-zinc-900 mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed text-base">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <DocsAccordion />

        <section className="w-full bg-white py-48 relative overflow-hidden border-t border-zinc-100">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-700 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-12 leading-[0.95]">Ready to generate <br /> your Web App?</h2>
            
            <p className="text-zinc-500 font-medium text-xl mb-20">
              Lifetime Access for only Rp{displayPrice}k. Secure your account before prices return to normal.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link href="/login?mode=register" className="w-full sm:w-auto px-16 py-6 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-[0.25em] rounded-2xl transition-all shadow-2xl active:scale-[0.98]">
                Secure Lifetime Access
              </Link>
              
              <a href={`mailto:${adminEmail}`} className="w-full sm:w-auto px-16 py-6 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.25em] rounded-2xl transition-all shadow-xl active:scale-[0.98]">
                Contact Support
              </a>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter settings={settings} />
    </div>
  );
}