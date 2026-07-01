"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/user.api";

// Current logged-in user. Resolves to the user on success, errors (401) when
// logged out — callers treat `data` presence as "is authenticated".
export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
