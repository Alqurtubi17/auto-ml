"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MLTaskType } from "@/types";
import { toast } from "sonner";

import Header from "@/components/dashboard/Header";
import TopNavigation from "@/components/dashboard/TopNavigation";
import SummarySidebar from "@/components/dashboard/SummarySidebar";
import StepOneConfig from "@/components/dashboard/StepOneConfig";
import StepTwoOptimize from "@/components/dashboard/StepTwoOptimize";

export const DEFAULT_PARAMS: Record<string, Record<string, string>> = {
  lr_clf: { C: "0.01, 0.1, 1, 10" },
  dt_clf: { max_depth: "None, 5, 10, 20" },
  rf_clf: { n_estimators: "50, 100, 200", max_depth: "None, 10, 20" },
  gb_clf: { n_estimators: "50, 100", learning_rate: "0.01, 0.1, 0.2" },
  svm_clf: { C: "0.1, 1, 10", kernel: "linear, rbf" },
  knn_clf: { n_neighbors: "3, 5, 7, 9" },
  mlp_clf: { hidden_layer_sizes: "(50,), (100,)", alpha: "0.0001, 0.001" },
  ada_clf: { n_estimators: "50, 100, 200" },
  et_clf: { n_estimators: "50, 100, 200", max_depth: "None, 10, 20" },
  ridge_reg: { alpha: "0.1, 1.0, 10.0" },
  lasso_reg: { alpha: "0.01, 0.1, 1.0" },
  elastic_reg: { alpha: "0.1, 1.0", l1_ratio: "0.2, 0.5, 0.8" },
  poly_reg: { polynomialfeatures__degree: "2, 3" },
  dt_reg: { max_depth: "None, 5, 10, 20" },
  rf_reg: { n_estimators: "50, 100, 200", max_depth: "None, 10, 20" },
  gb_reg: { n_estimators: "50, 100", learning_rate: "0.01, 0.1, 0.2" },
  svm_reg: { C: "0.1, 1, 10", kernel: "linear, rbf" },
  knn_reg: { n_neighbors: "3, 5, 7, 9" },
};

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  
  const [projectName, setProjectName] = useState("");
  const [taskType, setTaskType] = useState<MLTaskType>("classification");
  const [selectedAlgo, setSelectedAlgo] = useState("auto");
  const [useTuning, setUseTuning] = useState(false);
  const [customParams, setCustomParams] = useState<Record<string, string>>({});
  
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedX, setSelectedX] = useState<string[]>([]);
  const [selectedY, setSelectedY] = useState("");
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadTxt, setLoadTxt] = useState("Initializing...");

  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [previewTab, setPreviewTab] = useState<"before" | "after">("before");
  
  const [encodeLabels, setEncodeLabels] = useState(true);
  const [nanStrategy, setNanStrategy] = useState<"drop" | "mean" | "median">("mean");
  const [scalingStrategy, setScalingStrategy] = useState<"none" | "x" | "y" | "all">("none");

  const userName = user?.name || "Pelanggan";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    setSelectedAlgo("auto");
    setSelectedY("");
  }, [taskType]);

  useEffect(() => {
    if (selectedAlgo && DEFAULT_PARAMS[selectedAlgo]) {
      setCustomParams(DEFAULT_PARAMS[selectedAlgo]);
    } else {
      setCustomParams({});
    }
  }, [selectedAlgo]);

  useEffect(() => {
    if (!loading) return;
    const phrases = ["Analyzing Vectors...", "Training Models...", "Optimizing Weights...", "Building Dashboard..."];
    let i = 0;
    const interval = setInterval(() => { 
      i = (i + 1) % phrases.length; 
      setLoadTxt(phrases[i]); 
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null; 
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large! Maximum 5 MB.");
        e.target.value = "";
        return;
      }

      setDataFile(file);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) { 
          const lines = text.split('\n').filter(l => l.trim());
          const headers = lines[0].split(',').map(s => s.trim().replace(/["'\r]/g, ''));
          const rows = lines.slice(1, 6).map(line => line.split(',').map(s => s.trim().replace(/["'\r]/g, '')));
          
          setColumns(headers.filter(Boolean)); 
          setRawRows(rows);
          setSelectedX([]); 
          setSelectedY(""); 
          setPreviewTab("before");
        }
      };
      reader.readAsText(file);
    }
  };

  const processedRows = useMemo(() => {
    let currentRows = [...rawRows];

    if (nanStrategy === "drop") {
      currentRows = currentRows.filter(row => !row.some(v => v === "" || v === "NaN" || v === "null"));
    }

    const colStats = columns.map((_, colIdx) => {
      const nums = currentRows.map(r => parseFloat(r[colIdx])).filter(n => !isNaN(n));
      const mean = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
      const sorted = [...nums].sort((a, b) => a - b);
      const median = nums.length > 0 ? sorted[Math.floor(nums.length / 2)] : 0;
      return { mean, median };
    });

    return currentRows.map(row => {
      return row.map((val, colIdx) => {
        let v = val;
        const colName = columns[colIdx];

        if (v === "" || v === "NaN" || v === "null") {
          if (nanStrategy === "mean") v = colStats[colIdx].mean.toFixed(2);
          else if (nanStrategy === "median") v = colStats[colIdx].median.toFixed(2);
        }

        const isText = isNaN(Number(v));
        if (encodeLabels && isText && v !== "") {
          v = String(Math.abs(v.charCodeAt(0) % 5)); 
        }

        const isNumeric = !isNaN(Number(v));
        if (isNumeric && v !== "") {
          const isX = selectedX.includes(colName);
          const isY = selectedY === colName;
          let shouldScale = false;

          if (scalingStrategy === "all" && (isX || isY)) shouldScale = true;
          if (scalingStrategy === "x" && isX) shouldScale = true;
          if (scalingStrategy === "y" && isY) shouldScale = true;

          if (shouldScale) v = (Number(v) * 0.1).toFixed(3);
        }

        return v;
      });
    });
  }, [rawRows, nanStrategy, scalingStrategy, encodeLabels, columns, selectedX, selectedY]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || loading) return;
    
    setLoading(true);
    try {
      const job = await api.builds.create({ 
        projectName, 
        taskType, 
        algorithm: selectedAlgo, 
        dataFile, 
        featureColumns: selectedX, 
        targetColumn: selectedY,
        nanStrategy, 
        scalingStrategy, 
        useTuning, 
        hyperparameters: customParams,
        userId: user?.email || "anonim" 
      });
      
      toast.success("Deployment successful.");
      router.push(`/build/${job.id}`);
    } catch (err: any) {
      toast.error(err.message || "Execution failed. Check backend logs.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Header />
      <TopNavigation 
        loading={loading} step={step} setStep={setStep} projectName={projectName} 
        columns={columns} selectedX={selectedX} taskType={taskType} selectedY={selectedY} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-4 relative min-h-[600px]">
            <StepOneConfig 
              step={step} projectName={projectName} setProjectName={setProjectName} taskType={taskType} setTaskType={setTaskType}
              dataFile={dataFile} handleFileUpload={handleFileUpload} nanStrategy={nanStrategy} setNanStrategy={setNanStrategy}
              scalingStrategy={scalingStrategy} setScalingStrategy={setScalingStrategy} encodeLabels={encodeLabels} setEncodeLabels={setEncodeLabels}
              previewTab={previewTab} setPreviewTab={setPreviewTab} columns={columns} rawRows={rawRows} processedRows={processedRows}
              selectedX={selectedX} setSelectedX={setSelectedX} selectedY={selectedY} setSelectedY={setSelectedY} setStep={setStep}
            />
            <StepTwoOptimize 
              step={step} setStep={setStep} loading={loading} taskType={taskType} selectedAlgo={selectedAlgo}
              setSelectedAlgo={setSelectedAlgo} useTuning={useTuning} setUseTuning={setUseTuning} loadTxt={loadTxt}
              customParams={customParams} setCustomParams={setCustomParams}
            />
          </form>
        </div>

        <div className="lg:col-span-4 sticky top-20 space-y-4">
           <SummarySidebar 
             projectName={projectName} taskType={taskType} dataFile={dataFile} selectedX={selectedX} selectedY={selectedY}
           />
        </div>
      </div>
    </div>
  );
}