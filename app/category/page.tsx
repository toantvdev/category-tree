'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryTree } from '@/app/components/category/CategoryTree';
import type { Category } from '@/app/types/category/category';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function CategoriesPage() {
  const handleSelect = (category: Category | null) => {
    console.log('Selected category:', category);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '24px' }}>Quản lý danh mục</h1>
        <CategoryTree onSelect={handleSelect} />
      </div>
    </QueryClientProvider>
  );
}
