'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useApiToken() {
  const { getToken } = useClerkAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const t = await getToken();
        setToken(t);
      } catch (error) {
        setToken(null);
      }
    };
    fetchToken();
  }, [getToken]);

  return token;
}

