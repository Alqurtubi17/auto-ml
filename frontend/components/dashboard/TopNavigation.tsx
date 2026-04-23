export default function TopNavigation({ loading, step, setStep, projectName, columns, selectedX, taskType, selectedY }: any) {
  return (
    <div className={`flex gap-2 w-full bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-white/50 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
      {[1, 2].map((stepNumber) => (
        <button 
          key={stepNumber} 
          type="button" 
          disabled={loading}
          onClick={() => {
            if (stepNumber === 1) setStep(1);
            if (stepNumber === 2 && projectName.trim() && (columns.length === 0 || (selectedX.length > 0 && (taskType === "clustering" || selectedY)))) setStep(2);
          }}
          className="flex-1 relative"
        >
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= stepNumber ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-zinc-200"}`} />
          <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 text-center transition-all ${step >= stepNumber ? "text-emerald-700" : "text-zinc-400"}`}>
            {stepNumber === 1 ? "Config" : "Optimize"}
          </p>
        </button>
      ))}
    </div>
  );
}