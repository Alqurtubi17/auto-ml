"use client";

import { useBuildStatus } from "@/hooks/useBuildStatus";
import { BuildStatusPanel } from "@/components/BuildStatusPanel";
import { Activity } from "lucide-react";

import Header from "@/components/build/Header";
import MetricsGrid from "@/components/build/MetricsGrid";
import InferencePanel from "@/components/build/InferencePanel";
import ChartsPanel from "@/components/build/ChartsPanel";
import PythonSdkWidget from "@/components/build/PythonSdkWidget";
import ConsoleLinkPanel from "@/components/build/ConsoleLinkPanel";
import HyperparametersPanel from "@/components/build/HyperparametersPanel";

interface Props { params: { id: string } }

export default function DeploymentPage({ params }: Props) {
  const { build: project, isLoading } = useBuildStatus(params.id);

  if (isLoading || !project) return <div className="min-h-screen flex items-center justify-center text-xs font-bold text-zinc-400">Connecting Node...</div>;

  if (project.status !== "done") {
    return (
      <div className="py-6 flex justify-center">
        <div className="w-full max-w-xl space-y-4">
          <header className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
               <Activity className="w-3 h-3 animate-pulse" /> Calibration Active
            </div>
            <h1 className="text-xl font-bold text-zinc-900">Evolution in Progress</h1>
          </header>
          <BuildStatusPanel build={project} />
        </div>
      </div>
    );
  }

  const isClustering = project.taskType === "clustering";
  const algo = project.metrics?.algorithmName || "Automated Champion";
  const lat = project.metrics?.latencyMs ?? 0;

  let topMetricLabel = "F1-Score";
  let topMetricValue = `${((project.accuracy || 0) * 100).toFixed(1)}%`;
  if (project.taskType === "regression") {
    topMetricLabel = "Error Rate";
    topMetricValue = project.metrics?.detailedMetrics?.find((m: any) => m.name === "RMSE Error")?.value?.toFixed(3) || "0.000";
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4 animate-in fade-in duration-500">
      <Header project={project} algo={algo} />
      <MetricsGrid project={project} algo={algo} lat={lat} topMetricLabel={topMetricLabel} topMetricValue={topMetricValue} topMetricDesc="Primary model performance" />
      
      <HyperparametersPanel project={project} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4 space-y-4">
          <InferencePanel project={project} isClustering={isClustering} />
          {isClustering && <PythonSdkWidget project={project} />}
        </div>
        <div className="lg:col-span-8 space-y-4">
          <ChartsPanel project={project} isClustering={isClustering} scatterData={project.metrics?.scatterData || []} uniqueClusters={[]} />
          <ConsoleLinkPanel project={project} />
          {!isClustering && <PythonSdkWidget project={project} />}
        </div>
      </div>
    </div>
  );
}