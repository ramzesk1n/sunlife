import { useState, useEffect, useCallback } from 'react';

interface UseContentState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const cache = new Map<string, unknown>();

export function useContent<T>(filename: string): UseContentState<T> {
  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(filename);
    return cached ? (cached as T) : null;
  });
  const [loading, setLoading] = useState(!cache.has(filename));
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/content/${filename}.json?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const json = await response.json() as T;
      cache.set(filename, json);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    if (!cache.has(filename)) {
      fetchData();
    }
  }, [filename, fetchData]);

  const refresh = useCallback(() => {
    cache.delete(filename);
    fetchData();
  }, [filename, fetchData]);

  return { data, loading, error, refresh };
}
