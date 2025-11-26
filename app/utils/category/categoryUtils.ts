import type { Category } from '@/app/types/category/category';

// Sort categories theo order
export function sortByOrder(categories: Category[]): Category[] {
  return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function buildCategoryTree(categories: Category[]): Category[] {
  //  API đã có children → trả về luôn các node root
  const hasChildren = categories.some((cat) => cat.children && cat.children.length > 0);
  if (hasChildren) {
    const roots = categories.filter((cat) => cat.parent_id === null);
    // Sort children recursively
    const sortTree = (nodes: Category[]): Category[] => {
      return sortByOrder(nodes).map((node) => ({
        ...node,
        children: node.children ? sortTree(node.children) : [],
      }));
    };
    return sortTree(roots);
  }

  //  API trả về flat list → build cây thủ công
  const map = new Map<number, Category>();
  const roots: Category[] = [];

  // Tạo map và clone categories
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  // Build cây
  categories.forEach((cat) => {
    const node = map.get(cat.id);
    if (!node) return;

    if (cat.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(cat.parent_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    }
  });

  // Sort tất cả levels theo order
  const sortTree = (nodes: Category[]): Category[] => {
    return sortByOrder(nodes).map((node) => ({
      ...node,
      children: node.children ? sortTree(node.children) : [],
    }));
  };

  return sortTree(roots);
}

// Kiểm tra xem có thể drop dragId vào dropId không
export function canDropInto(dragId: number, dropId: number, categories: Category[]): boolean {
  if (dragId === dropId) return false;

  const descendants = getAllDescendants(dragId, categories);

  return !descendants.some((d) => d.id === dropId);
}

// Lấy tất cả con cháu của một node
function getAllDescendants(id: number, categories: Category[]): Category[] {
  const result: Category[] = [];
  const children = categories.filter((c) => c.parent_id === id);

  children.forEach((child) => {
    result.push(child);
    result.push(...getAllDescendants(child.id, categories));
  });

  return result;
}

// Flatten cây thành danh sách phẳng (nếu cần)
export function flattenTree(categories: Category[]): Category[] {
  const result: Category[] = [];

  function traverse(cats: Category[]) {
    cats.forEach((cat) => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    });
  }

  traverse(categories);
  return result;
}
