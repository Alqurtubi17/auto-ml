"use client";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/api";

interface Props {
  children: React.ReactNode;
}

export function SWRProvider({ children }: Props) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        onError(err) {
          if (process.env.NODE_ENV === "development") {
            console.error("[SWR]", err?.message ?? err);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
