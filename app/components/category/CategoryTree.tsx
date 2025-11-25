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
  const { expandedIds, toggleExpand, setSelected, expandAll, collapseAll } = useCategoryStore();

  const { data: categories = [], isLoading } = useCategoryQuery();
  const createMutation = useCreateCategory();
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

  const getCategoryName = (cat: Category) => (locale === 'en' ? cat.name_en : cat.name_vi);
  const categoryTree = buildCategoryTree(categories);

  const convertToTreeData = (cats: Category[]): DataNode[] =>
    cats.map((cat) => ({
      key: cat.id,
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{getCategoryName(cat)}</span>
          <CategoryActions
            category={cat}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ),
      icon: expandedIds.has(cat.id) ? <FolderOpenOutlined /> : <FolderOutlined />,
      children: cat.children?.length ? convertToTreeData(cat.children) : undefined,
    }));

  const handleAdd = (parentId: string | null = null) => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ parent_id: parentId });
    setIsModalOpen(true);
  };

  const handleEdit = (c: Category) => {
    setEditingCategory(c);
    form.setFieldsValue({ name_vi: c.name_vi, name_en: c.name_en });
    setIsModalOpen(true);
  };

  const handleDelete = (c: Category) => setDeletingCategory(c);

  const handleModalOk = async (values: any) => {
    console.log('Values từ form:', values);

    // TẠO OBJECT THEO ĐÚNG THỨ TỰ BẠN MUỐN
    const payload = {
      name_vi: values.name_vi.trim(),
      name_en: values.name_en?.trim() || values.name_vi.trim(),
      slug: values.slug?.trim() || generateSlug(values.name_vi),
      order: Number(values.order ?? 999),
      creator_id: values.creator_id || '1',
      modifier_id: values.modifier_id || '1',
      parent_id: values.parent_id ? String(values.parent_id) : null,
    };

    console.log('PAYLOAD GỬI LÊN (ĐÚNG THỨ TỰ):', payload);

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          name_vi: payload.name_vi,
          name_en: payload.name_en,
        });
      } else {
        await createMutation.mutateAsync(payload); // ← ĐÚNG THỨ TỰ 100%
      }

      messageApi.success(t(editingCategory ? 'updateSuccess' : 'createSuccess'));
      setIsModalOpen(false);
    } catch (error: any) {
      messageApi.error(error?.message || t('failed'));
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(String(deletingCategory.id));
      messageApi.success(t('deleteSuccess'));
      setDeletingCategory(null);
    } catch (error: any) {
      messageApi.error(error?.message || t('deleteFailed'));
    }
  };

  const onDrop: TreeProps['onDrop'] = async (info) => {
    const dragId = info.dragNode.key as string;
    const dropId = info.node.key as string;

    if (!canDropInto(dragId, dropId, categories)) {
      return messageApi.warning(t('moveFailedChild'));
    }

    try {
      const updates: UpdateCategoryOrder[] = [];
      let newParentId: string | null = null;
      let newOrder = 0;

      if (!info.dropToGap) {
        newParentId = dropId;
        const childrenOfDrop = categories.filter((c) => c.parent_id === dropId);
        newOrder = childrenOfDrop.length;
      } else {
        const dropCategory = categories.find((c) => c.id === dropId);
        newParentId = dropCategory?.parent_id || null;

        const siblings = categories
          .filter((c) => c.parent_id === newParentId && c.id !== dragId)
          .sort((a, b) => a.order - b.order);

        if (info.dropPosition < 0) {
          newOrder = dropCategory?.order ?? 0;
        } else {
          newOrder = (dropCategory?.order ?? 0) + 1;
        }

        siblings.forEach((sibling) => {
          if (sibling.order >= newOrder) {
            updates.push({
              id: sibling.id,
              parent_id: sibling.parent_id,
              order: sibling.order + 1,
            });
          }
        });
      }

      updates.push({
        id: dragId,
        parent_id: newParentId,
        order: newOrder,
      });

      await updateOrderMutation.mutateAsync(updates);
      messageApi.success(t('moveSuccess'));
    } catch (error: any) {
      messageApi.error(error?.message || t('moveFailed'));
    }
  };

  if (isLoading) {
    return (
      <Spin tip={t('loading')}>
        <div style={{ height: 200 }} />
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

      <Space style={{ marginBottom: 20 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAdd()}
          disabled={isProcessing}
        >
          {t('addRoot')}
        </Button>
        <Button icon={<ExpandOutlined />} onClick={expandAll} disabled={isProcessing}>
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
        onExpand={(_, info) => toggleExpand(info.node.key as string)}
        onSelect={(keys) => {
          const id = keys[0] as string;
          setSelected(id);
          onSelect?.(categories.find((c) => c.id === id) || null);
        }}
      />

      <CategoryFormModal
        open={isModalOpen}
        isEditing={!!editingCategory}
        form={form}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setIsModalOpen(false);
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
