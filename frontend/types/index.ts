export type TemplateCategory =
  | "saas" | "ecommerce" | "portfolio" | "blog" | "restaurant"
  | "realestate" | "healthcare" | "education" | "agency" | "startup";

export type BuildStatus =
  | "idle" | "queued" | "training" | "generating" | "done" | "error" | "stopped";

export interface TemplateSection {
  id: string;
  type: "hero" | "features" | "pricing" | "cta" | "testimonials" | "gallery" | "contact" | "faq";
  config: Record<string, unknown>;

}

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  accent: string;
  sections: TemplateSection[];
  mlFeatures: string[];
  estimatedBuildSec: number;
}

export interface MLMetrics {
  accuracy: number | null;
  latencyMs: number | null;
  modelSize: string | null;
  algorithmName?: string | null;
  bestParameters?: Record<string, any> | null;
  chartData?: Array<{ name: string; value: number }> | null;
  detailedMetrics?: Array<{ name: string; value: number }> | null;
  scatterData?: Array<{ x: number; y: number; cluster: number }> | null;
  totalRows?: number | null;
}

export interface BuildJob {
  id: string;
  templateId: string;
  status: BuildStatus;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  outputUrl: string | null;
  logs: string[];
  mlMetrics: MLMetrics | null;
}

export interface GenerateRequest {
  templateId: string;
  projectName: string;
  primaryColor: string;
  userDescription: string;
  dataFile?: string;
}

export type MLTaskType = "classification" | "regression" | "clustering";

export interface MLProject {
  id: string;
  userId: string;
  projectName: string;
  taskType: MLTaskType;
  status: BuildStatus;
  progress: number;
  createdAt: string;
  completedAt: string | null;
  huggingFaceUrl: string | null;
  generatedCode: string | null;
  uiSchema: Record<string, any> | null;
  logs: string[];
  metrics: MLMetrics | null;
  accuracy?: number | null;
  totalRows?: number | null;
}

export interface GenerateMLRequest {
  projectName: string;
  taskType: MLTaskType;
  algorithm: string;
  dataFile?: File | null;
  targetColumn?: string;
  featureColumns?: string[];
  nanStrategy?: "drop" | "mean" | "median";
  scalingStrategy?: "none" | "x" | "y" | "all";
  useTuning?: boolean;
  hyperparameters?: Record<string, string>;
  userId?: string;
}

export interface SystemStats {
  totalBuilds: number;
  avgAccuracy: number;
  cpuUsage: number;
  totalCores: number;
  activeCores: number;
  storageUsed: string;
  storageLimit: string;
  storagePercent: number;
  computeStatus: string;
  activeKeys: number;
  region: string;
  nodeId: string;
  networkLatency: number;
  uptime: string;
  userInitials: string;
}
