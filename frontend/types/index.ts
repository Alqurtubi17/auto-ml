// All field names are camelCase to match FastAPI's alias-generated JSON output.

export type TemplateCategory =
  | "saas" | "ecommerce" | "portfolio" | "blog" | "restaurant"
  | "realestate" | "healthcare" | "education" | "agency" | "startup";

export type BuildStatus =
  | "idle" | "queued" | "training" | "generating" | "done" | "error" | "stopped";

export interface TemplateSection {
  id:     string;
  type:   "hero" | "features" | "pricing" | "cta" | "testimonials" | "gallery" | "contact" | "faq";
  config: Record<string, unknown>;
}

export interface TemplateConfig {
  id:                 string;
  name:               string;
  category:           TemplateCategory;
  description:        string;
  accent:             string;
  sections:           TemplateSection[];
  mlFeatures:         string[];      // backend: ml_features  → alias: mlFeatures
  estimatedBuildSec:  number;        // backend: estimated_build_sec → alias: estimatedBuildSec
}

export interface MLMetrics {
  accuracy:  number | null;
  latencyMs: number | null;          // backend: latency_ms → alias: latencyMs
  modelSize: string | null;          // backend: model_size → alias: modelSize
  algorithmName?: string | null;
  chartData?: Array<{ name: string; value: number }> | null;
}

export interface BuildJob {
  id:          string;
  templateId:  string;               // backend: template_id → alias: templateId
  status:      BuildStatus;
  progress:    number;
  createdAt:   string;               // backend: created_at → alias: createdAt
  completedAt: string | null;        // backend: completed_at → alias: completedAt
  outputUrl:   string | null;        // backend: output_url → alias: outputUrl
  logs:        string[];
  mlMetrics:   MLMetrics | null;     // backend: ml_metrics → alias: mlMetrics
}

export interface GenerateRequest {
  templateId:      string;           // backend: template_id → alias: templateId
  projectName:     string;           // backend: project_name → alias: projectName
  primaryColor:    string;           // backend: primary_color → alias: primaryColor
  userDescription: string;           // backend: user_description → alias: userDescription
  dataFile?:       string;
}

export type MLTaskType = "classification" | "regression" | "clustering";

export interface MLProject {
  id:          string;
  projectName: string;
  taskType:    MLTaskType;
  status:      BuildStatus;
  progress:    number;
  createdAt:   string;               
  completedAt: string | null;        
  huggingFaceUrl: string | null;
  generatedCode: string | null;
  uiSchema: Record<string, any> | null;
  logs:        string[];
  metrics:   MLMetrics | null;
  accuracy?: number | null;
}

export interface GenerateMLRequest {
  projectName:     string;
  taskType:        MLTaskType;
  algorithm:       string;
  dataFile?:       File | null;
  targetColumn?:   string;
  featureColumns?: string[];
}
