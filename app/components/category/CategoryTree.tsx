'use client';
import { useState } from 'react';
import { Tree, Button, Space, Spin, Form, message } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import {
  ExpandOutlined,
  CompressOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useCategoryStore } from '@/app/store/category/categoryStore';
import {
  useCategoryQuery,
  useCreateCategory,
  useCreateChildCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryOrder,
} from '@/app/hooks/category/useCategoryQuery';
import { buildCategoryTree, canDropInto } from '@/app/utils/category/categoryUtils';
import type { Category, UpdateCategoryOrder } from '@/app/types/category/category';

import { CategoryActions } from './CategoryActions';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryDeleteModal } from './CategoryDeleteModal';

export function CategoryTree({ onSelect }: { onSelect?: (cat: Category | null) => void }) {
  const locale = useLocale() as 'en' | 'vi';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const t = useTranslations('categoryTree');
  const { expandedIds, toggleExpand, setSelected, expandAll, collapseAll, selectedId } =
    useCategoryStore();

  const { data: categories = [], isLoading } = useCategoryQuery();
  const createMutation = useCreateCategory();
  const createChildMutation = useCreateChildCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const updateOrderMutation = useUpdateCategoryOrder();

  const [messageApi, contextHolder] = message.useMessage();

  const generateSlug = (text: string): string => {
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
  };

  const getCategoryName = (cat: Category) =>
    locale === 'en' ? cat.name_en || cat.name_vi : cat.name_vi;

  const categoryTree = buildCategoryTree(categories);

  const convertToTreeData = (cats: Category[]): DataNode[] =>
    cats.map((cat) => ({
      key: cat.id,
      title: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '2px 4px',
          }}
        >
          <span className="flex relative -top-5 left-7">{getCategoryName(cat)}</span>
          <CategoryActions
            category={cat}
            onAdd={() => handleAddChild(cat.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ),
      icon: expandedIds.has(cat.id) ? <FolderOpenOutlined /> : <FolderOutlined />,
      children: cat.children?.length ? convertToTreeData(cat.children) : undefined,
    }));

  const handleAdd = (parentId: number | null = null) => {
    setEditingCategory(null);
    setIsModalOpen(true);
    setSelected(null);

    // Tính order cho root category mới
    if (parentId === null) {
      const rootCategories = categories.filter((c) => c.parent_id === null);
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

  const handleAddChild = (parentId: number) => {
    setSelected(parentId);
    setEditingCategory(null);
    setIsModalOpen(true);

    const findParentNode = (nodes: Category[]): Category | undefined => {
      for (const node of nodes) {
        if (node.id === parentId) return node;
        if (node.children && node.children.length > 0) {
          const found = findParentNode(node.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const parentNode = findParentNode(categoryTree);
    const currentChildren = parentNode?.children || [];
    const newOrder =
      currentChildren.length > 0 ? Math.max(...currentChildren.map((c) => c.order || 0)) + 1 : 0;

    setTimeout(() => {
      form.setFieldsValue({
        parent_id: parentId,
        order: newOrder,
      });
    }, 50);
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
      } else if (selectedId) {
        await createChildMutation.mutateAsync({
          parentId: selectedId,
          dto: payload,
        });
        messageApi.success(t('createSuccess'));
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

      // Cập nhật lại order cho các siblings còn lại
      const siblings = categories.filter(
        (c) => c.parent_id === deletingCategory.parent_id && c.id !== deletingCategory.id
      );

      if (siblings.length > 0) {
        const sortedSiblings = siblings.sort((a, b) => (a.order || 0) - (b.order || 0));
        const updates: UpdateCategoryOrder[] = sortedSiblings.map((cat, index) => ({
          id: cat.id,
          parent_id: cat.parent_id,
          order: index,
        }));

        await updateOrderMutation.mutateAsync(updates);
      }

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

    if (!canDropInto(dragKey, dropKey, categories)) {
      messageApi.warning('Không thể di chuyển danh mục vào con cháu của nó!');
      return;
    }

    const treeData = categoryTree;

    const findNode = (nodes: Category[], key: number): Category | null => {
      for (const node of nodes) {
        if (node.id === key) return node;
        if (node.children?.length) {
          const found = findNode(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };

    const getParentAndSiblings = (
      nodes: Category[],
      targetKey: number,
      parentNode: Category | null = null
    ): {
      parent: Category | null;
      siblings: Category[];
    } | null => {
      for (const node of nodes) {
        if (node.id === targetKey) {
          return { parent: parentNode, siblings: nodes };
        }
        if (node.children?.length) {
          const result = getParentAndSiblings(node.children, targetKey, node);
          if (result) return result;
        }
      }
      return null;
    };

    const dragNode = findNode(treeData, dragKey);
    if (!dragNode) return;

    try {
      let newParentId: number | null = null;
      let newSiblings: Category[] = [];

      // Drop vào bên trong node (thành con)
      if (!info.dropToGap) {
        newParentId = dropKey;
        const parentNode = findNode(treeData, dropKey);
        newSiblings = parentNode?.children || [];

        // Thêm dragNode vào cuối
        newSiblings = [...newSiblings.filter((c) => c.id !== dragKey), dragNode];
      }
      // Drop vào khoảng trống (cùng cấp)
      else {
        const dropNodeInfo = getParentAndSiblings(treeData, dropKey);
        if (!dropNodeInfo) return;

        newParentId = dropNodeInfo.parent?.id ?? null;
        let siblings = [...dropNodeInfo.siblings.filter((c) => c.id !== dragKey)];

        // Tìm vị trí insert
        const dropIndex = siblings.findIndex((c) => c.id === dropKey);
        if (dropIndex === -1) return;

        let insertIndex: number;

        if (dropPosition === -1) {
          insertIndex = dropIndex;
        } else if (dropPosition === 1) {
          insertIndex = dropIndex + 1;
        } else {
          return;
        }
        siblings.splice(insertIndex, 0, dragNode);

        newSiblings = siblings;
      }

      // Sắp xếp lại order cho tất cả siblings (index từ 0)
      const updates: UpdateCategoryOrder[] = newSiblings.map((cat, index) => ({
        id: cat.id,
        parent_id: newParentId,
        order: index,
      }));

      // Gửi tất cả updates cùng lúc
      await updateOrderMutation.mutateAsync(updates);

      messageApi.success(t('moveSuccess'));
    } catch (err: any) {
      console.error('Error during drag & drop:', err);
      messageApi.error(err.message || t('moveFailed'));
    }
  };

  if (isLoading) {
    return (
      <Spin tip={t('loading')}>
        <div style={{ height: 300 }} />
      </Spin>
    );
  }

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    updateOrderMutation.isPending;

  return (
    <>
      {contextHolder}

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAdd(null)}
          disabled={isProcessing}
        >
          {t('addRoot')}
        </Button>
        <Button
          icon={<ExpandOutlined />}
          onClick={() => {
            const getAllIds = (cats: Category[]): number[] => {
              let ids: number[] = [];
              cats.forEach((cat) => {
                ids.push(cat.id);
                if (cat.children && cat.children.length > 0) {
                  ids.push(...getAllIds(cat.children));
                }
              });
              return ids;
            };
            expandAll(getAllIds(categoryTree));
          }}
          disabled={isProcessing || categories.length === 0}
        >
          {t('expandAll')}
        </Button>
        <Button icon={<CompressOutlined />} onClick={collapseAll} disabled={isProcessing}>
          {t('collapseAll')}
        </Button>
      </Space>

      <Tree
        showIcon
        draggable
        blockNode
        disabled={isProcessing}
        onDrop={onDrop}
        treeData={convertToTreeData(categoryTree)}
        expandedKeys={[...expandedIds]}
        onExpand={(_, info) => toggleExpand(Number(info.node.key))}
        onSelect={(keys) => {
          const id = keys[0] ? Number(keys[0]) : undefined;
          setSelected(id || null);
          onSelect?.(categories.find((c) => c.id === id) || null);
        }}
      />

      <CategoryFormModal
        open={isModalOpen}
        isEditing={!!editingCategory}
        editingCategory={editingCategory}
        form={form}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        onSubmit={handleModalOk}
      />

      <CategoryDeleteModal
        open={!!deletingCategory}
        category={deletingCategory}
        loading={deleteMutation.isPending}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        getName={getCategoryName}
      />
    </>
  );
}
