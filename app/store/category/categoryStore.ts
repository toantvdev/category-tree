import { create } from 'zustand';
import { mockCategoriesData } from '@/app/constants/category/data';

interface CategoryState {
  expandedIds: Set<string>;
  selectedId: string | null;
  draggedId: string | null;
  toggleExpand: (id: string) => void;
  setSelected: (id: string | null) => void;
  setDragged: (id: string | null) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  expandedIds: new Set<string>(),
  selectedId: null,
  draggedId: null,

  toggleExpand: (id: string) =>
    set((state) => {
      const newExpanded = new Set(state.expandedIds);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { expandedIds: newExpanded };
    }),

  setSelected: (id: string | null) => set({ selectedId: id }),

  setDragged: (id: string | null) => set({ draggedId: id }),

  expandAll: () => set({ expandedIds: new Set(mockCategoriesData.map((c) => c.id)) }),

  collapseAll: () => set({ expandedIds: new Set() }),
}));
