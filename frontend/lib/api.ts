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
    create: (body: GenerateMLRequest) =>
      apiFetch<MLProject>("/api/builds", { method: "POST", body: JSON.stringify(body) }),
    get:    (id: string) => 
      apiFetch<MLProject>(`/api/builds/${id}`),
    list:   () => 
      apiFetch<{ builds: MLProject[] }>("/api/builds"),
    predict: (id: string, features: Record<string, number>) =>
      apiFetch<{ status: string; prediction: string; raw_value: number }>(`/api/builds/${id}/predict`, {
        method: "POST",
        body: JSON.stringify({ features }),
      }),
  },
};

export const fetcher = (url: string) => apiFetch<unknown>(url);