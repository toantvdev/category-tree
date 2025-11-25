import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/app/services/category/categoryService';
import type {
  CreateCategory,
  UpdateCategory,
  UpdateCategoryOrder,
} from '@/app/types/category/category';

export const CATEGORY_QUERY_KEY = ['categories'];

export const useCategoryQuery = () => {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEY,
    queryFn: categoryService.getAll,
  });
};

// Tạo category mới
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategory) => categoryService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
    },
  });
};

// Cập nhật category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCategory) => categoryService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
    },
  });
};

// Xóa category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
    },
  });
};

// Cập nhật thứ tự / parent
export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: UpdateCategoryOrder[]) => categoryService.updateOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
    },
  });
};
