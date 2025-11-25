"use client";
import { useState } from "react";
import { Tree, Button, Space, Spin, Form, message } from "antd";
import type { DataNode, TreeProps } from "antd/es/tree";
import {
  ExpandOutlined,
  CompressOutlined,
  PlusOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
import { useCategoryStore } from "@/app/store/category/categoryStore";
import {
  useCategoryQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryOrder,
} from "@/app/hooks/category/useCategoryQuery";
import {
  buildCategoryTree,
  canDropInto,
} from "@/app/utils/category/categoryUtils";
import type {
  Category,
  UpdateCategoryOrder,
} from "@/app/types/category/category";

import { CategoryActions } from "./CategoryActions";
import { CategoryFormModal } from "./CategoryFormModal";
import { CategoryDeleteModal } from "./CategoryDeleteModal";

export function CategoryTree({
  onSelect,
}: {
  onSelect?: (cat: Category | null) => void;
}) {
  const locale = useLocale() as "en" | "vi";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [form] = Form.useForm();
  const t = useTranslations("categoryTree");
  const { expandedIds, toggleExpand, setSelected, expandAll, collapseAll } =
    useCategoryStore();

  const { data: categories = [], isLoading } = useCategoryQuery();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const updateOrderMutation = useUpdateCategoryOrder();

  const [messageApi, contextHolder] = message.useMessage();

  const generateSlug = (text: string): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const getCategoryName = (cat: Category) =>
    locale === "en" ? cat.name_en || cat.name_vi : cat.name_vi;

  const categoryTree = buildCategoryTree(categories);

  const convertToTreeData = (cats: Category[]): DataNode[] =>
    cats.map((cat) => ({
      key: cat.id,
      title: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span>{getCategoryName(cat)}</span>
          <CategoryActions
            category={cat}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      ),
      icon: expandedIds.has(cat.id) ? (
        <FolderOpenOutlined />
      ) : (
        <FolderOutlined />
      ),
      children: cat.children?.length
        ? convertToTreeData(cat.children)
        : undefined,
    }));

  const handleAdd = (parentId: string | null = null) => {
    setEditingCategory(null);
    setIsModalOpen(true);
    form.setFieldsValue({ parent_id: parentId });
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
        order: Number(values.order ?? 999),
        creator_id: "1",
        modifier_id: "1",
        parent_id: values.parent_id || null,
      };

      console.log("PAYLOAD GỬI LÊN (đúng thứ tự):", payload);

      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          ...payload,
        });
        messageApi.success(t("updateSuccess"));
      } else {
        await createMutation.mutateAsync(payload);
        messageApi.success(t("createSuccess"));
      }

      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error("Lỗi khi lưu danh mục:", error);
      messageApi.error(error?.message || "Thao tác thất bại");
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(String(deletingCategory.id));
      messageApi.success(t("deleteSuccess"));
      setDeletingCategory(null);
    } catch (error: any) {
      messageApi.error(error?.message || t("deleteFailed"));
    }
  };

  const onDrop: TreeProps["onDrop"] = async (info) => {
    const dragId = info.dragNode.key as string;
    const dropId = info.node.key as string;
    const dropToGap = info.dropToGap;

    // 1. Cấm kéo cha xuống làm con cháu
    if (!canDropInto(dragId, dropId, categories)) {
      messageApi.warning("Không thể di chuyển danh mục vào con cháu của nó!");
      return;
    }

    // Tìm node đang kéo để lấy dữ liệu cũ (bắt buộc vì backend cần đúng thứ tự)
    const draggedCat = categories.find((c) => c.id === dragId);
    if (!draggedCat) return;

    try {
      let newParentId: string | null = null;
      let newOrder = 0;

      if (!dropToGap) {
        // Kéo vào trong node → làm con
        newParentId = dropId;
        // order = số con hiện tại của parent mới → bắt đầu từ 0
        const children = categories.filter((c) => c.parent_id === dropId);
        newOrder = children.length; // 0, 1, 2... → tự động là cuối danh sách
      } else {
        // Kéo lên/xuống trong cùng cấp
        const dropNode = categories.find((c) => c.id === dropId);
        if (!dropNode) return;

        newParentId = dropNode.parent_id;

        // Lấy tất cả anh em (cùng parent, trừ chính nó)
        const siblings = categories
          .filter((c) => c.parent_id === newParentId && c.id !== dragId)
          .sort((a, b) => a.order - b.order);

        const dropIndex = siblings.findIndex((s) => s.id === dropId);

        if (info.dropPosition < 0) {
          // Kéo lên trên
          newOrder = dropIndex === 0 ? 0 : siblings[dropIndex - 1].order + 1;
        } else {
          // Kéo xuống dưới
          newOrder = siblings[dropIndex].order + 1;
        }

        // Cập nhật lại order cho các node bị ảnh hưởng (dùng updateOrder nếu cần)
        const updates: UpdateCategoryOrder[] = [];
        siblings.forEach((sib, idx) => {
          let expectedOrder = idx;
          if (info.dropPosition < 0 && idx >= dropIndex) expectedOrder++;
          if (info.dropPosition > 0 && idx > dropIndex) expectedOrder++;

          if (sib.order !== expectedOrder) {
            updates.push({
              id: sib.id,
              parent_id: sib.parent_id,
              order: expectedOrder,
            });
          }
        });

        if (updates.length > 0) {
          await updateOrderMutation.mutateAsync(updates);
        }
      }

      // GỬI ĐỦ + ĐÚNG THỨ TỰ – DÙ CHỈ MUỐN ĐỔI parent_id & order
      await updateMutation.mutateAsync({
        id: dragId,
        name_vi: draggedCat.name_vi,
        name_en: draggedCat.name_en || draggedCat.name_vi,
        slug: draggedCat.slug,
        order: newOrder,
        creator_id: "1",
        modifier_id: "1",
        parent_id: newParentId,
      });

      messageApi.success("Di chuyển thành công!");
    } catch (error: any) {
      console.error("Lỗi kéo thả:", error);
      messageApi.error("Di chuyển thất bại!");
    }
  };

  if (isLoading) {
    return (
      <Spin tip={t("loading")}>
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
          {t("addRoot")}
        </Button>
        <Button
          icon={<ExpandOutlined />}
          onClick={expandAll}
          disabled={isProcessing}
        >
          {t("expandAll")}
        </Button>
        <Button
          icon={<CompressOutlined />}
          onClick={collapseAll}
          disabled={isProcessing}
        >
          {t("collapseAll")}
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
          const id = keys[0] as string | undefined;
          setSelected(id || null);
          onSelect?.(categories.find((c) => c.id === id) || null);
        }}
      />

      {/* TRUYỀN ĐỦ editingCategory */}
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
