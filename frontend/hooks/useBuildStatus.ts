import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { MLProject } from "@/types";

const POLL_INTERVAL_MS = 1200;

export function useBuildStatus(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MLProject>(
    id ? `/api/v1/builds/${id}` : null,
    fetcher as any,
    {
      refreshInterval: (data: MLProject | undefined) => {
        if (!data) return POLL_INTERVAL_MS;
        return data.status === "done" || data.status === "error" ? 0 : POLL_INTERVAL_MS;
      },
      revalidateOnFocus: false,
      dedupingInterval: 600,
    }
  );

  const isTerminal = data?.status === "done" || data?.status === "error";
  const isActive = !!data && !isTerminal;

  return { build: data, error, isLoading, isActive, isTerminal, refresh: mutate };
}

export function useBuildList() {
  const { data, error, isLoading, mutate } = useSWR<{ builds: MLProject[] }>(
    "/api/v1/builds",
    fetcher as any,
    { refreshInterval: 5000, revalidateOnFocus: true }
  );

  return {
    builds: data?.builds ?? [],
    error,
    isLoading,
    refresh: mutate,
  };
}
