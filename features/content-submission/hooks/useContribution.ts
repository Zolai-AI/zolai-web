"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  reviewContribution,
  type Contribution,
  type ContributionAction,
} from "@/features/content-submission/api/contributions";
import { CONTRIBUTIONS_KEY } from "@/features/content-submission/hooks/useContributions";

/**
 * Act on a single contribution (`POST /api/contributions/:id` — approve /
 * reject, admin only) and refresh the contributions list on success.
 */
export function useContributionReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; action: ContributionAction }) =>
      reviewContribution(input.id, input.action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONTRIBUTIONS_KEY });
    },
  });
}

/** Single contribution by id, read from the cached list query. */
export function useContribution(id: string | null) {
  return useQuery({
    queryKey: CONTRIBUTIONS_KEY,
    select: (items: Contribution[]) => items.find((i) => i.id === id) ?? null,
    enabled: !!id,
    retry: false,
  });
}
