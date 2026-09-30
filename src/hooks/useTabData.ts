// hooks/useTabData.ts

import { useEffect, useState } from 'react';

export const useTabData = (fetchFn: any, active: boolean) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!active || fetched) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchFn();
        setData(res || []);
        setFetched(true); // ✅ cache
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [active]);

  return { data, loading };
};