import { useTranslations } from 'next-intl';
import type { FormInstance } from 'antd';
import type { TreeProps } from 'antd/es/tree';
import type { MessageInstance } from 'antd/es/message/interface';
import type { Category, UpdateCategoryOrder } from '@/app/types/category/category';
import {
  canDropInto,
  buildTreeFromFlatList,
  flattenTreeToList,
  findNodeInTree,
  getParentAndSiblings,
  generateSlug,
} from '@/app/utils/category/categoryUtils';

interface UseCategoryTreeLogicProps {
  locale: 'en' | 'vi';
  categories: Category[];
  pendingOrderChanges: UpdateCategoryOrder[];
  setPendingOrderChanges: React.Dispatch<React.SetStateAction<UpdateCategoryOrder[]>>;
  form: FormInstance;
  setIsModalOpen: (open: boolean) => void;
  setEditingCategory: (cat: Category | null) => void;
  setDeletingCategory: (cat: Category | null) => void;
  setSelected: (id: number | null) => void;
  selectedId: number | null;
  editingCategory: Category | null;
  deletingCategory: Category | null;
  messageApi: MessageInstance;
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  updateOrderMutation: any;
}

export function useCategoryTreeLogic({
  locale,
  categories,
  pendingOrderChanges,
  setPendingOrderChanges,
  form,
  setIsModalOpen,
  setEditingCategory,
  setDeletingCategory,
  setSelected,
  selectedId,
  editingCategory,
  deletingCategory,
  messageApi,
  createMutation,
  updateMutation,
  deleteMutation,
  updateOrderMutation,
}: UseCategoryTreeLogicProps) {
  const t = useTranslations('categoryTree');

  const getCategoryName = (cat: Category) =>
    locale === 'en' ? cat.name_en || cat.name_vi : cat.name_vi;

  // Lấy categories đã áp dụng pending changes
  const getModifiedCategories = (): Category[] => {
    // Flatten tree về flat list (loại bỏ children)
    const flatList = flattenTreeToList(categories);

    if (pendingOrderChanges.length === 0) return flatList;

    // Áp dụng pending changes
    const categoriesMap = new Map(flatList.map((cat) => [cat.id, { ...cat }]));
    pendingOrderChanges.forEach((change) => {
      const cat = categoriesMap.get(change.id);
      if (cat) {
        cat.parent_id = change.parent_id;
        cat.order = change.order;
      }
    });

    return Array.from(categoriesMap.values());
  };

  // Build tree từ flat list
  const buildCategoryTreeForce = (cats: Category[]): Category[] => {
    return buildTreeFromFlatList(cats);
  };

  const handleAdd = (parentId: number | null = null) => {
    setEditingCategory(null);
    setIsModalOpen(true);
    setSelected(null);

    const modifiedCategories = getModifiedCategories();

    if (parentId === null) {
      const rootCategories = modifiedCategories.filter((c) => c.parent_id === null);
      const maxOrder =
        rootCategories.length > 0 ? Math.max(...rootCategories.map((c) => c.order || 0)) : -1;
      form.setFieldsValue({
        parent_id: null,
        order: maxOrder + 1,
      });
    } else {
      form.setFieldsValue({ parent_id: parentId });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleModalOk = async (values: any) => {
    try {
      const nameVi = values.name_vi?.trim();
      if (!nameVi) return;

      const nameEn = values.name_en?.trim() || nameVi;
      const slug = values.slug?.trim() || generateSlug(nameVi);
      const payload = {
        name_vi: nameVi,
        name_en: nameEn,
        slug: slug,
        order: Number(values.order ?? 0),
        creator_id: '1',
        modifier_id: '1',
        parent_id: values.parent_id ? Number(values.parent_id) : null,
      };

      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          ...payload,
        });
        messageApi.success(t('updateSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        messageApi.success(t('createSuccess'));
      }

      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error(t('errorSave'), error);
      messageApi.error(error?.message || t('failed'));
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      messageApi.success(t('deleteSuccess'));
      setDeletingCategory(null);
    } catch (error: any) {
      messageApi.error(error?.message || t('deleteFailed'));
    }
  };

  const onDrop: TreeProps['onDrop'] = async (info) => {
    const dropKey = info.node.key as number;
    const dragKey = info.dragNode.key as number;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const modifiedCategories = getModifiedCategories();

    if (!canDropInto(dragKey, dropKey, modifiedCategories)) {
      messageApi.warning('Không thể di chuyển danh mục vào con cháu của nó!');
      return;
    }

    const categoryTree = buildCategoryTreeForce(modifiedCategories);

    // Sử dụng findNodeInTree từ utils
    const dragNode = findNodeInTree(categoryTree, dragKey);
    if (!dragNode) return;

    try {
      let newParentId: number | null = null;
      let newSiblings: Category[] = [];

      if (!info.dropToGap) {
        // Drop vào trong node
        newParentId = dropKey;
        const parentNode = findNodeInTree(categoryTree, dropKey);
        newSiblings = parentNode?.children || [];
        newSiblings = [...newSiblings.filter((c) => c.id !== dragKey), dragNode];
      } else {
        // Drop cùng cấp
        const dropNodeInfo = getParentAndSiblings(categoryTree, dropKey);
        if (!dropNodeInfo) return;

        const { parent, siblings: rawSiblings } = dropNodeInfo;
        newParentId = parent?.id ?? null;

        // Clone và loại drag node
        const siblings = rawSiblings.filter((c) => c.id !== dragKey);

        let insertIndex = info.dropPosition;

        // Clamp giá trị
        if (insertIndex < 0) insertIndex = 0;
        if (insertIndex > siblings.length) insertIndex = siblings.length;

        // Chèn
        siblings.splice(insertIndex, 0, dragNode);
        newSiblings = siblings;
      }
      // Tạo updates cho TẤT CẢ siblings
      const updates: UpdateCategoryOrder[] = newSiblings.map((cat, index) => ({
        id: cat.id,
        parent_id: newParentId,
        order: index,
      }));

      // Cập nhật pending changes
      setPendingOrderChanges((prev) => {
        const affectedIds = new Set(updates.map((u) => u.id));
        const filtered = prev.filter((p) => !affectedIds.has(p.id));
        return [...filtered, ...updates];
      });

      messageApi.info(t('notifiSave'));
    } catch (err: any) {
      messageApi.error(err.message || t('failed'));
    }
  };

  const handleSubmitOrderChanges = async () => {
    if (pendingOrderChanges.length === 0) {
      messageApi.info(t('notifiError'));
      return;
    }

    try {
      await updateOrderMutation.mutateAsync(pendingOrderChanges);
      messageApi.success(t('saveOrderSuccess', { count: pendingOrderChanges.length }));
      setPendingOrderChanges([]);
    } catch (err: any) {
      console.error('Error submitting order changes:', err);
      messageApi.error(err.message || t('moveFailed'));
    }
  };

  const handleCancelOrderChanges = () => {
    setPendingOrderChanges([]);
    messageApi.info(t('cancelAll'));
  };

  return {
    getCategoryName,
    getModifiedCategories,
    buildCategoryTreeForce,
    handleAdd,
    handleEdit,
    handleDelete,
    handleModalOk,
    confirmDelete,
    onDrop,
    handleSubmitOrderChanges,
    handleCancelOrderChanges,
  };
}
