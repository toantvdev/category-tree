'use client';

import { useQuery } from '@tanstack/react-query';

export default function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ['demo'],
    queryFn: async () => {
      await new Promise((res) => setTimeout(res, 500));
      return 'Hello from React Query';
    },
  });

  return <h1>{isLoading ? 'Loading...' : data}</h1>;
}
