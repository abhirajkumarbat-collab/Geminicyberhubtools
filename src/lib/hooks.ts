import { useEffect, useState, useCallback, type DependencyList } from 'react';

export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  deps: DependencyList = [],
  initial: T,
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    fetcher()
      .then((d) => { setData(d); setError(null); })
      .catch((e) => { setError(e instanceof Error ? e.message : 'Failed to load'); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
