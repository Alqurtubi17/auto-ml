import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api";
import { GenerateRequest, BuildJob } from "@/types";

async function postGenerate(_key: string, { arg }: { arg: GenerateRequest }): Promise<BuildJob> {
  return api.builds.create(arg);
}

export function useSiteGenerate() {
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);

  const { trigger, isMutating, error, reset } = useSWRMutation("/api/builds", postGenerate, {
    onSuccess(data) {
      setActiveBuildId(data.id);
    },
  });

  async function generate(req: GenerateRequest) {
    setActiveBuildId(null);
    return trigger(req);
  }

  return { generate, isMutating, error, activeBuildId, reset };
}
