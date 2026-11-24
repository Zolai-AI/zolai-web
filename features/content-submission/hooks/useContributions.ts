"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContribution,
  listContributions,
  type CreateContributionInput,
} from "@/features/content-submission/api/contributions";

export const CONTRIBUTIONS_KEY = ["contributions"] as const;

/** Recent community contributions (`/api/contributions`). */
export function useContributions() {
  return useQuery({
    queryKey: CONTRIBUTIONS_KEY,
    queryFn: listContributions,
    retry: false,
  });
}

/** Submit a new contribution (`/api/contributions`). */
export function useCreateContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContributionInput) => createContribution(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONTRIBUTIONS_KEY });
    },
  });
}
