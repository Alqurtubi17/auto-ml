import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { MLProject } from "@/types";

const POLL_INTERVAL_MS = 3000; // 3 seconds is more reasonable

export function useBuildStatus(id: string | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<MLProject>(
    id ? `/api/v1/builds/${id}` : null,
    fetcher as any,
    {
      refreshInterval: (data: MLProject | undefined) => {
        if (!data) return 10000; // Poll slowly (10s) until we get the first data
        return data.status === "done" || data.status === "error" ? 0 : POLL_INTERVAL_MS;
      },
      revalidateOnFocus: false,
      dedupingInterval: 3000,
    }
  );

  const isTerminal = data?.status === "done" || data?.status === "error";
  const isActive = !!data && !isTerminal;

  return { build: data, error, isLoading: isLoading || (!data && isValidating), isActive, isTerminal, refresh: mutate };
}

export function useBuildList() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ builds: MLProject[] }>(
    "/api/v1/builds",
    fetcher as any,
    { 
      refreshInterval: 10000, // 10 seconds is enough for the list
      revalidateOnFocus: true,
      dedupingInterval: 5000
    }
  );

  return {
    builds: data?.builds ?? [],
    error,
    isLoading: isLoading || (!data && isValidating),
    refresh: mutate,
  };
}
