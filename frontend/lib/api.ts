// frontend/lib/api.ts
import { MLProject, GenerateMLRequest } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  builds: {
    create: async (body: GenerateMLRequest) => {
      const formData = new FormData();
      formData.append("project_name", body.projectName);
      formData.append("task_type", body.taskType);
      formData.append("algorithm", body.algorithm);
      
      if (body.targetColumn) formData.append("target_column", body.targetColumn);
      if (body.featureColumns && body.featureColumns.length > 0) {
        formData.append("feature_columns", body.featureColumns.join(","));
      }
      if (body.dataFile) {
        formData.append("file", body.dataFile);
      }

      const res = await fetch(`${BASE}/api/v1/builds`, {
        method: "POST",
        body: formData,
        // Omit Content-Type to let browser set boundary automatically
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => res.statusText);
        throw new Error(detail);
      }
      return res.json() as Promise<MLProject>;
    },
    get:    (id: string) => 
      apiFetch<MLProject>(`/api/v1/builds/${id}`),
    list:   () => 
      apiFetch<{ builds: MLProject[] }>("/api/v1/builds"),
    predict: (id: string, features: Record<string, number>) =>
      apiFetch<{ status: string; prediction: string; raw_value: number }>(`/api/v1/builds/${id}/predict`, {
        method: "POST",
        body: JSON.stringify({ features }),
      }),
    delete: (id: string) =>
      apiFetch<{ status: string }>(`/api/v1/builds/${id}`, { method: "DELETE" }),
    stop: (id: string) =>
      apiFetch<{ status: string }>(`/api/v1/builds/${id}/stop`, { method: "POST" }),
    updateConfig: (id: string, config: Record<string, any>) =>
      apiFetch<{ status: string }>(`/api/v1/builds/${id}/config`, { 
        method: "PUT",
        body: JSON.stringify(config)
      }),
  },
};

export const fetcher = (url: string) => apiFetch<unknown>(url);