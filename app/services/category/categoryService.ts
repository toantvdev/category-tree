import axios from 'axios';
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
    const { data } = await axios.get<ApiResponse<Category[]>>(`${BASE_URL}/category/tree`);
    return data.data || [];
  },

  // Tạo mới category
  create: async (dto: CreateCategory): Promise<Category> => {
    try {
      const { data } = await axios.post<ApiResponse<Category>>(`${BASE_URL}/category`, dto);
      return data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create category');
    }
  },

  // Cập nhật category
  update: async (dto: UpdateCategory): Promise<Category> => {
    try {
      const payload = {
        name_vi: dto.name_vi,
        name_en: dto.name_en || dto.name_vi,
        slug: dto.slug,
        order: dto.order ?? 1,
        creator_id: '1',
        modifier_id: '1',
        parent_id: dto.parent_id ?? null,
      };
      const { data } = await axios.patch<ApiResponse<Category>>(
        `${BASE_URL}/category/category/${dto.id}`,
        payload
      );
      return data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Cập nhật danh mục thất bại');
    }
  },

  // Cập nhật thứ tự và parent
  updateOrder: async (updates: UpdateCategoryOrder[]): Promise<void> => {
    try {
      const promises = updates.map((update) =>
        axios.patch<ApiResponse<Category>>(
          `${BASE_URL}/category/update-categories-position/`,
          updates
        )
      );
      await Promise.all(promises);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Cập nhật thứ tự thất bại');
    }
  },

  // Xóa category
  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/category/${id}`);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to delete category');
    }
  },

  // Lấy toàn bộ con cháu của 1 node
  getDescendants: async (id: number): Promise<Category[]> => {
    const { data } = await axios.get<ApiResponse<Category[]>>(
      `${BASE_URL}/category/descendants/${id}`
    );
    return data.data || [];
  },

  // Lấy cây danh mục (alias của getAll)
  getTree: async (): Promise<Category[]> => {
    return categoryService.getAll();
  },
};
