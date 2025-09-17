import { useQuery } from "@tanstack/react-query";

export interface Market {
  id: string;
  address: string;
  question: string;
  description?: string;
  categoryId: string;
  creatorAddress: string;
  oracleAddress: string;
  initialTokenValue: string;
  initialYesProbability: number;
  percentageToLock: number;
  expirationTime: string;
  initialLiquidity: string;
  status: "ACTIVE" | "REPORTED" | "RESOLVED" | "EXPIRED";
  isReported: boolean;
  winningOutcome?: "YES" | "NO";
  resolvedAt?: string;
  totalVolume: string;
  totalParticipants: number;
  yesTokenPrice?: string;
  noTokenPrice?: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  };
}

export interface MarketsResponse {
  markets: Market[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarketsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useMarkets(params: MarketsParams = {}) {
  return useQuery<MarketsResponse>({
    queryKey: ["markets", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.category) searchParams.set("category", params.category);
      if (params.status) searchParams.set("status", params.status);
      if (params.search) searchParams.set("search", params.search);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const response = await fetch(`/api/markets?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch markets");
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMarket(address: string) {
  return useQuery<Market>({
    queryKey: ["market", address],
    queryFn: async () => {
      const response = await fetch(`/api/markets/${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch market");
      }
      return response.json();
    },
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
