"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useCurrentUser } from "./use-user";
import * as adminApi from "@/lib/api/admin.api";
import type { ListParams } from "@/lib/api/admin.api";

// Admin gate: `role` comes back on /user/me now, so this piggybacks on the
// already-cached "me" query instead of an extra request.
export function useIsAdmin() {
  const { data, isLoading, isError } = useCurrentUser();
  return { isAdmin: data?.role === "admin", isLoading, isError };
}

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminApi.getOverviewStats,
    staleTime: 60 * 1000,
  });
}

export function useAdminUsers(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.getUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useSetUserActiveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.setUserActiveStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminContributions(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "contributions", params],
    queryFn: () => adminApi.getContributions(params),
    placeholderData: keepPreviousData,
  });
}

export function useApproveContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contributions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "contributors"] });
    },
  });
}

export function useRejectContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.rejectContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contributions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "contributors"] });
    },
  });
}

export function useAdminContributors(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "contributors", params],
    queryFn: () => adminApi.getContributors(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminContributorDetail(phone: string | null) {
  return useQuery({
    queryKey: ["admin", "contributor-detail", phone],
    queryFn: () => adminApi.getContributorDetail(phone as string),
    enabled: Boolean(phone),
  });
}

export function useAdminHandouts(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "handouts", params],
    queryFn: () => adminApi.getHandouts(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPastMcqs(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "mcqs-past", params],
    queryFn: () => adminApi.getPastMcqs(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminAiMcqs(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "mcqs-ai", params],
    queryFn: () => adminApi.getAiMcqs(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminWrongAnswers(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "wrong-answers", params],
    queryFn: () => adminApi.getWrongAnswers(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminFeedback(params: ListParams) {
  return useQuery({
    queryKey: ["admin", "feedback", params],
    queryFn: () => adminApi.getFeedback(params),
    placeholderData: keepPreviousData,
  });
}
