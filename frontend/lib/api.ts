import { BuildJob, GenerateRequest, TemplateConfig } from "@/types";

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
  templates: {
    list: ()        => apiFetch<{ templates: TemplateConfig[] }>("/api/templates"),
    get:  (id: string) => apiFetch<TemplateConfig>(`/api/templates/${id}`),
  },
  builds: {
    create: (body: GenerateRequest) =>
      apiFetch<BuildJob>("/api/builds", { method: "POST", body: JSON.stringify(body) }),
    get:    (id: string)   => apiFetch<BuildJob>(`/api/builds/${id}`),
    list:   ()             => apiFetch<{ builds: BuildJob[] }>("/api/builds"),
    cancel: (id: string)   => apiFetch<{ ok: boolean }>(`/api/builds/${id}/cancel`, { method: "POST" }),
  },
};

/** SWR-compatible fetcher — used as the global SWR fetcher in SWRProvider. */
export const fetcher = (url: string) => apiFetch<unknown>(url);
