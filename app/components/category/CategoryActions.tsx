'use client';
import { Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Category } from '@/app/types/category/category';

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryActions({ category, onEdit, onDelete }: Props) {
  return (
    <Space size="small">
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(category);
        }}
      />
      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(category);
        }}
      />
    </Space>
  );
}
