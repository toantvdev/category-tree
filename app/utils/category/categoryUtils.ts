import type { Category } from '@/app/types/category/category';

// Sort categories theo order
export function sortByOrder(categories: Category[]): Category[] {
  return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Flatten cây thành danh sách phẳng - LOẠI BỎ children để tránh duplicate
export function flattenTreeToList(categories: Category[]): Category[] {
  const result: Category[] = [];

  function traverse(cats: Category[]) {
    cats.forEach((cat) => {
      // Clone category KHÔNG có children
      result.push({
        id: cat.id,
        name_vi: cat.name_vi,
        name_en: cat.name_en,
        slug: cat.slug,
        order: cat.order,
        creator_id: cat.creator_id,
        modifier_id: cat.modifier_id,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
        parent_id: cat.parent_id,
      });

      if (cat.children && cat.children.length > 0) {
        traverse(cat.children);
      }
    });
  }

  traverse(categories);
  return result;
}

// Flatten cây thành danh sách - GIỮ LẠI children (cho các case cần)
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

// Build tree từ flat list - FORCE rebuild, không dùng children có sẵn
export function buildTreeFromFlatList(categories: Category[]): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];

  // Tạo map và clone categories - KHÔNG có children
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  // Build cây từ đầu
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
      children: node.children && node.children.length > 0 ? sortTree(node.children) : [],
    }));
  };

  return sortTree(roots);
}

// Build tree - AUTO detect: nếu có children thì sort, không thì build mới
export function buildCategoryTree(categories: Category[]): Category[] {
  // API đã có children → chỉ cần sort
  const hasChildren = categories.some((cat) => cat.children && cat.children.length > 0);
  if (hasChildren) {
    const roots = categories.filter((cat) => cat.parent_id === null);
    const sortTree = (nodes: Category[]): Category[] => {
      return sortByOrder(nodes).map((node) => ({
        ...node,
        children: node.children ? sortTree(node.children) : [],
      }));
    };
    return sortTree(roots);
  }

  // API trả về flat list → build cây mới
  return buildTreeFromFlatList(categories);
}

// Tìm một node trong cây
export function findNodeInTree(nodes: Category[], id: number): Category | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Lấy parent và siblings của một node
export function getParentAndSiblings(
  nodes: Category[],
  targetId: number,
  parentNode: Category | null = null
): {
  parent: Category | null;
  siblings: Category[];
} | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return { parent: parentNode, siblings: nodes };
    }
    if (node.children?.length) {
      const result = getParentAndSiblings(node.children, targetId, node);
      if (result) return result;
    }
  }
  return null;
}

// Kiểm tra xem có thể drop dragId vào dropId không
export function canDropInto(dragId: number, dropId: number, categories: Category[]): boolean {
  if (dragId === dropId) return false;

  const descendants = getAllDescendants(dragId, categories);

  return !descendants.some((d) => d.id === dropId);
}

// Lấy tất cả con cháu của một node
export function getAllDescendants(id: number, categories: Category[]): Category[] {
  const result: Category[] = [];
  const children = categories.filter((c) => c.parent_id === id);

  children.forEach((child) => {
    result.push(child);
    result.push(...getAllDescendants(child.id, categories));
  });

  return result;
}

// Generate slug từ text tiếng Việt
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
