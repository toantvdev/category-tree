'use client';

import { Modal, Form, Input, FormInstance } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  isEditing: boolean;
  editingCategory?: any; // nếu có thì truyền vào để fill form
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
  const t = useTranslations('categoryTree');

  // Hàm sinh slug tiếng Việt đẹp
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (open) {
      if (isEditing && editingCategory) {
        // Khi sửa → điền dữ liệu cũ
        form.setFieldsValue({
          name_vi: editingCategory.name_vi,
          name_en: editingCategory.name_en || '',
          slug: editingCategory.slug || '',
          order: editingCategory.order || 0,
          parent_id: editingCategory.parent_id,
        });
      } else {
        // Khi tạo mới → chỉ set mặc định cần thiết
        form.resetFields();
        form.setFieldsValue({
          slug: '',
          order: 999,
          creator_id: '1',
          modifier_id: '1',
          parent_id: null,
        });
      }
    }
  }, [open, isEditing, editingCategory, form]);

  // Tự động sinh slug khi gõ name_vi
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
      // Antd tự hiện lỗi
    }
  };

  return (
    <Modal
      title={isEditing ? t('edit') || 'Sửa danh mục' : t('add') || 'Thêm danh mục'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={isEditing ? 'Cập nhật' : 'Tạo mới'}
      cancelText="Hủy"
      width={520}
    >
      <Form form={form} layout="vertical">
        {/* Field ẩn */}
        <Form.Item name="parent_id" noStyle>
          <Input hidden />
        </Form.Item>
        <Form.Item name="creator_id" initialValue="1" noStyle>
          <Input hidden />
        </Form.Item>
        <Form.Item name="modifier_id" initialValue="1" noStyle>
          <Input hidden />
        </Form.Item>
        <Form.Item name="order" noStyle>
          <Input hidden />
        </Form.Item>

        {/* Field hiển thị */}
        <Form.Item
          name="name_vi"
          label={t('nameVi') || 'Tên tiếng Việt'}
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input placeholder="Ví dụ: Điện thoại di động" autoFocus onChange={handleNameViChange} />
        </Form.Item>

        <Form.Item name="name_en" label={t('nameEn') || 'Tên tiếng Anh'}>
          <Input placeholder="Mobile Phones" />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug (tự động sinh)"
          rules={[{ required: true, message: 'Slug không được để trống!' }]}
        >
          <Input placeholder="tu-dong-sinh" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
