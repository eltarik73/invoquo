"use client";

import { useCallback, useEffect, useState } from "react";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Try refresh on 401
  if (res.status === 401 && token) {
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
    const refreshData = await refreshRes.json();
    if (refreshData.success) {
      localStorage.setItem("accessToken", refreshData.data.accessToken);
      // Retry with new token
      const retryRes = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshData.data.accessToken}`,
          ...options.headers,
        },
      });
      const retryData: ApiResponse<T> = await retryRes.json();
      if (!retryData.success) throw new Error(retryData.error);
      return retryData.data as T;
    }
    // Refresh failed — redirect to login
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw new Error("Session expiree");
  }

  const data: ApiResponse<T> = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data as T;
}

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(url);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
