import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useSubscription() {
  const { isAuthenticated } = useAuth();

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ["/api/subscription/status"],
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    hasActiveSubscription: (subscriptionData as any)?.hasActiveSubscription || false,
    subscriptionId: (subscriptionData as any)?.subscriptionId,
    planId: (subscriptionData as any)?.planId,
    status: (subscriptionData as any)?.status || "FREE",
    isLoading,
    isPremium: (subscriptionData as any)?.hasActiveSubscription || false,
  };
}