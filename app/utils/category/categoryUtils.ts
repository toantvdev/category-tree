import type { Category } from '@/app/types/category/category';

export const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // Tạo map và khởi tạo children array
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Xây dựng tree
  categoryMap.forEach((category) => {
    if (category.parent_id === null) {
      rootCategories.push(category);
    } else {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children!.push(category);
      }
    }
  });

  // Sắp xếp theo order
  const sortByOrder = (cats: Category[]) => {
    cats.sort((a, b) => a.order - b.order);
    cats.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        sortByOrder(cat.children);
      }
    });
  };

  sortByOrder(rootCategories);
  return rootCategories;
};

export const flattenTree = (categories: Category[], level = 0): Category[] => {
  const result: Category[] = [];
  categories.forEach((category) => {
    result.push({ ...category, level });
    if (category.children && category.children.length > 0) {
      result.push(...flattenTree(category.children, level + 1));
    }
  });
  return result;
};

export const canDropInto = (
  draggedId: string,
  targetId: string,
  categories: Category[]
): boolean => {
  // Không thể kéo vào chính nó
  if (draggedId === targetId) return false;

  // Kiểm tra xem target có phải là con của dragged không
  const isDescendant = (parentId: string, childId: string): boolean => {
    const category = categories.find((c) => c.id === childId);
    if (!category || !category.parent_id) return false;
    if (category.parent_id === parentId) return true;
    return isDescendant(parentId, category.parent_id);
  };

  return !isDescendant(draggedId, targetId);
};
