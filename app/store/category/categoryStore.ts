import { create } from 'zustand';

interface CategoryState {
  expandedIds: Set<number>;
  selectedId: number | null;
  draggedId: number | null;

  toggleExpand: (id: number) => void;
  setSelected: (id: number | null) => void;
  setDragged: (id: number | null) => void;
  expandAll: (allIds: number[]) => void; // nhận vào danh sách ID
  collapseAll: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  expandedIds: new Set<number>(),
  selectedId: null,
  draggedId: null,

  toggleExpand: (id: number) =>
    set((state) => {
      const newExpanded = new Set(state.expandedIds);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { expandedIds: newExpanded };
    }),

  setSelected: (id: number | null) => set({ selectedId: id }),
  setDragged: (id: number | null) => set({ draggedId: id }),

  expandAll: (allIds: number[]) => set({ expandedIds: new Set(allIds) }),

  collapseAll: () => set({ expandedIds: new Set() }),
}));
