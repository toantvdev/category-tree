import type {
  Category,
  CreateCategory,
  UpdateCategory,
  UpdateCategoryOrder,
} from '@/app/types/category/category';

const BASE_URL = 'https://ant-category-tree.onrender.com';

// Interface cho API response wrapper
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export const categoryService = {
  // Lấy toàn bộ cây danh mục
  getAll: async (): Promise<Category[]> => {
    const response = await fetch(`${BASE_URL}/category/tree`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const result: ApiResponse<Category[]> = await response.json();
    return result.data || [];
  },

  // Tạo mới category
  create: async (dto: CreateCategory): Promise<Category> => {
    const response = await fetch(`${BASE_URL}/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create category' }));
      throw new Error(error.message || 'Failed to create category');
    }
    const result: ApiResponse<Category> = await response.json();
    return result.data;
  },

  // Cập nhật category
  update: async (dto: UpdateCategory): Promise<Category> => {
    const response = await fetch(`${BASE_URL}/category/${dto.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name_vi: dto.name_vi,
        name_en: dto.name_en,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update category' }));
      throw new Error(error.message || 'Failed to update category');
    }
    const result: ApiResponse<Category> = await response.json();
    return result.data;
  },

  // Xóa category
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/category/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete category' }));
      throw new Error(error.message || 'Failed to delete category');
    }
  },

  // Cập nhật thứ tự và parent (gọi API update cho từng category)
  updateOrder: async (updates: UpdateCategoryOrder[]): Promise<void> => {
    // Gọi API update cho từng category
    const promises = updates.map((update) =>
      fetch(`${BASE_URL}/category/${update.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent_id: update.parent_id,
          order: update.order,
        }),
      }).then((res) => {
        if (!res.ok) throw new Error(`Failed to update order for category ${update.id}`);
        return res.json();
      })
    );

    await Promise.all(promises);
  },

  // Lấy toàn bộ con cháu của 1 node
  getDescendants: async (id: string): Promise<Category[]> => {
    const response = await fetch(`${BASE_URL}/category/descendants/${id}`);
    if (!response.ok) throw new Error('Failed to fetch descendants');
    const result: ApiResponse<Category[]> = await response.json();
    return result.data || [];
  },

  // Lấy cây danh mục (alias của getAll)
  getTree: async (): Promise<Category[]> => {
    return categoryService.getAll();
  },
};
