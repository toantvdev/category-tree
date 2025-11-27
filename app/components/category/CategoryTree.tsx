'use client';
import { useState } from 'react';
import { Space, Spin, Form, message } from 'antd';
import { useLocale } from 'next-intl';
import { useCategoryStore } from '@/app/store/category/categoryStore';
import {
  useCategoryQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryOrder,
} from '@/app/hooks/category/useCategoryQuery';
import type { Category, UpdateCategoryOrder } from '@/app/types/category/category';

import { CategoryTreeView } from './CategoryTreeView';
import { CategoryToolbar } from './CategoryTreeToolbar';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryDeleteModal } from './CategoryDeleteModal';
import { useCategoryTreeLogic } from '@/app/hooks/category/useCategoryTreeLogic';

export function CategoryTree({ onSelect }: { onSelect?: (cat: Category | null) => void }) {
  const locale = useLocale() as 'en' | 'vi';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const { expandedIds, toggleExpand, setSelected, expandAll, collapseAll, selectedId } =
    useCategoryStore();

  const [pendingOrderChanges, setPendingOrderChanges] = useState<UpdateCategoryOrder[]>([]);

  const { data: categories = [], isLoading } = useCategoryQuery();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const updateOrderMutation = useUpdateCategoryOrder();

  const [messageApi, contextHolder] = message.useMessage();

  const {
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
  } = useCategoryTreeLogic({
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
  });

  const modifiedCategories = getModifiedCategories();
  const categoryTree = buildCategoryTreeForce(modifiedCategories);

  if (isLoading) {
    return (
      <Spin tip="Đang tải...">
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

      <Space style={{ marginBottom: 16 }} wrap>
        <CategoryToolbar
          onAddRoot={() => handleAdd(null)}
          onExpandAll={() => {
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
          onCollapseAll={collapseAll}
          onSaveChanges={handleSubmitOrderChanges}
          onCancelChanges={handleCancelOrderChanges}
          pendingChangesCount={pendingOrderChanges.length}
          isProcessing={isProcessing}
          isSaving={updateOrderMutation.isPending}
          hasCategories={categories.length > 0}
        />
      </Space>

      <CategoryTreeView
        categoryTree={categoryTree}
        expandedIds={expandedIds}
        modifiedCategories={modifiedCategories}
        isProcessing={isProcessing}
        getCategoryName={getCategoryName}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDrop={onDrop}
        onExpand={toggleExpand}
        onSelect={(id, cat) => {
          setSelected(id || null);
          onSelect?.(cat || null);
        }}
      />

      <CategoryFormModal
        open={isModalOpen}
        isEditing={!!editingCategory}
        editingCategory={editingCategory}
        categories={categoryTree}
        form={form}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        onSubmit={handleModalOk}
        getCategoryName={getCategoryName}
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
