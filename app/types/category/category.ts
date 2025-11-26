export interface Category {
  id: number;
  slug: string;
  name_vi: string;
  name_en: string;
  order: number;
  created_at: string;
  updated_at: string;
  creator_id: string;
  modifier_id: string | null;
  parent_id: number | null;
  children?: Category[];
  level?: number;
}

export interface UpdateCategoryOrder {
  id: number;
  parent_id: number | null;
  order: number;
}

export interface CreateCategory {
  name_vi: string;
  name_en?: string;
  parent_id?: number | null;
  creator_id: string;
  modifier_id?: string;
}

export interface UpdateCategory {
  id: number;
  name_vi: string;
  name_en: string;
  slug: string;
  order: number;
  creator_id: string;
  modifier_id: string;
  parent_id: number | null;
}
