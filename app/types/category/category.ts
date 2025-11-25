export interface Category {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  order: number;
  created_at: string;
  updated_at: string;
  creator_id: string;
  modifier_id: string | null;
  parent_id: string | null;
  children?: Category[];
  level?: number;
}

export interface UpdateCategoryOrder {
  id: string;
  parent_id: string | null;
  order: number;
}

export interface CreateCategory {
  name_vi: string;
  name_en?: string;
  parent_id?: string | null;
  creator_id: string; // bắt buộc
  modifier_id?: string; // thường cũng cần
}

export interface UpdateCategory {
  id: string;
  name_vi: string;
  name_en: string;
  slug: string;
  order: number;
  creator_id: string;
  modifier_id: string;
  parent_id: string | null;
}