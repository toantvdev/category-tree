"use client";

import { Modal, Form, Input, FormInstance } from "antd";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface Props {
  open: boolean;
  isEditing: boolean;
  editingCategory?: any;
  form: FormInstance<any>;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

export function CategoryFormModal({
  open,
  isEditing,
  editingCategory,
  form,
  loading,
  onCancel,
  onSubmit,
}: Props) {
  const t = useTranslations("categoryTree");

  const generateSlug = (text: string) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  useEffect(() => {
    if (!open) return;

    if (isEditing && editingCategory) {
      form.setFieldsValue({
        name_vi: editingCategory.name_vi || "",
        name_en: editingCategory.name_en || "",
        slug: editingCategory.slug || "",
        order: editingCategory.order ?? 999,
        parent_id: editingCategory.parent_id || null,
        creator_id: editingCategory.creator_id || "1",
        modifier_id: editingCategory.modifier_id || "1",
      });
    } else {
      // Tạo mới
      form.resetFields();
      form.setFieldsValue({
        name_vi: "",
        name_en: "",
        slug: "",
        order: 999,
        parent_id: null,
        creator_id: "1",
        modifier_id: "1",
      });
    }
  }, [open, isEditing, editingCategory, form]);

  const handleNameViChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const slug = generateSlug(value);
    form.setFieldsValue({ slug });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (err) {}
  };

  return (
    <Modal
      title={
        isEditing ? t("edit") || "Sửa danh mục" : t("add") || "Thêm danh mục"
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={isEditing ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      width={520}
    >
      <Form form={form} layout="vertical">
        {/* Các field ẩn */}
        <Form.Item name="parent_id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="creator_id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="modifier_id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="order" noStyle>
          <Input type="hidden" />
        </Form.Item>

        {/* Các field hiển thị */}
        <Form.Item
          name="name_vi"
          label={t("nameVi") || "Tên tiếng Việt"}
          rules={[{ required: true, message: "Vui lòng nhập tên tiếng Việt!" }]}
        >
          <Input
            placeholder="Ví dụ: Điện thoại di động"
            autoFocus
            onChange={handleNameViChange}
          />
        </Form.Item>

        <Form.Item
          name="name_en"
          label={t("nameEn") || "Tên tiếng Anh (không bắt buộc)"}
        >
          <Input placeholder="Mobile Phones" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug (tự động sinh, có thể sửa)"
          rules={[{ required: true, message: "Slug không được để trống!" }]}
        >
          <Input placeholder="dien-thoai-di-dong" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
