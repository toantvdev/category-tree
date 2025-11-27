'use client';

import { Modal, Form, Input, Select, FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import type { Category } from '@/app/types/category/category';

interface Props {
  open: boolean;
  isEditing: boolean;
  editingCategory?: Category | null;
  categories: Category[]; // Danh sách categories để chọn parent
  form: FormInstance<any>;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  getCategoryName: (cat: Category) => string;
}

export function CategoryFormModal({
  open,
  isEditing,
  editingCategory,
  categories,
  form,
  loading,
  onCancel,
  onSubmit,
  getCategoryName,
}: Props) {
  const t = useTranslations('categoryTree');

  const generateSlug = (text: string) => {
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

  // Tạo danh sách options cho Select - hiển thị dạng tree với indent
  const buildCategoryOptions = (cats: Category[], level = 0): any[] => {
    const options: any[] = [];

    cats.forEach((cat) => {
      // Thêm indent để hiển thị cấp độ (sử dụng full-width space)
      const indent = ' '.repeat(level);

      // Disable nếu đang edit và là chính nó (tránh chọn parent là chính mình)
      const isDisabled = isEditing && editingCategory && cat.id === editingCategory.id;

      options.push({
        value: cat.id,
        label: `${indent}${getCategoryName(cat)}`,
        disabled: isDisabled,
      });

      // Đệ quy thêm children
      if (cat.children && cat.children.length > 0) {
        options.push(...buildCategoryOptions(cat.children, level + 1));
      }
    });

    return options;
  };

  const categoryOptions = [
    { value: null, label: '-- Root Category --' },
    ...buildCategoryOptions(categories),
  ];

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (isEditing && editingCategory) {
      form.setFieldsValue({
        name_vi: editingCategory.name_vi || '',
        name_en: editingCategory.name_en || '',
        slug: editingCategory.slug || '',
        order: editingCategory.order ?? 0,
        parent_id: editingCategory.parent_id || null,
        creator_id: editingCategory.creator_id || '1',
        modifier_id: editingCategory.modifier_id || '1',
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
    } catch (err) {
      // Validation failed
    }
  };

  return (
    <Modal
      forceRender
      title={isEditing ? t('edit') : t('add')}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={isEditing ? t('update') : t('create')}
      cancelText={t('cancel')}
      width={600}
    >
      <Form form={form} layout="vertical">
        {/* Các field ẩn */}
        <Form.Item name="creator_id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="modifier_id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="order" noStyle>
          <Input type="hidden" />
        </Form.Item>

        {/* Parent Category Selector - ĐẶT TRƯỚC nameVi */}
        <Form.Item
          name="parent_id"
          label={t('catRoot')}
          tooltip="Chọn danh mục cha. Chọn 'Root Category' nếu muốn tạo danh mục gốc"
        >
          <Select
            placeholder="Chọn parent category hoặc để Root"
            options={categoryOptions}
            showSearch
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Các field hiển thị */}
        <Form.Item
          name="name_vi"
          label={t('nameVi')}
          rules={[{ required: true, message: t('validatedNameVi') }]}
        >
          <Input placeholder={t('exampleVi')} autoFocus onChange={handleNameViChange} />
        </Form.Item>

        <Form.Item
          name="name_en"
          label={t('nameEn')}
          rules={[{ required: true, message: t('validatedNameEn') }]}
        >
          <Input placeholder={t('exampleEn')} />
        </Form.Item>

        <Form.Item
          name="slug"
          label={t('slug')}
          rules={[{ required: true, message: t('slugValidated') }]}
        >
          <Input placeholder={t('slugEx')} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
