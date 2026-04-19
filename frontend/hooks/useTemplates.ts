import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { TemplateConfig, TemplateCategory } from "@/types";
import { TEMPLATES } from "@/lib/templates";

interface TemplateListResponse {
  templates: TemplateConfig[];
}

export function useTemplates(category?: TemplateCategory) {
  const { data, error, isLoading } = useSWR<TemplateListResponse>(
    "/api/templates",
    fetcher,
    {
      fallbackData: { templates: TEMPLATES },
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  const templates = category
    ? (data?.templates ?? []).filter((t) => t.category === category)
    : (data?.templates ?? []);

  return { templates, error, isLoading };
}

export function useTemplate(id: string | null) {
  const { data, error, isLoading } = useSWR<TemplateConfig>(
    id ? `/api/templates/${id}` : null,
    fetcher,
    {
      fallbackData: id ? TEMPLATES.find((t) => t.id === id) : undefined,
      revalidateOnFocus: false,
    }
  );
  return { template: data, error, isLoading };
}
