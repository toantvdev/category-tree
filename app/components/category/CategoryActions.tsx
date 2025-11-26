'use client';
import { Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Category } from '@/app/types/category/category';

interface Props {
  category: Category;
  onAdd: (parentId: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryActions({ category, onAdd, onEdit, onDelete }: Props) {
  return (
    <Space size="small">
      <Button
        type="text"
        size="small"
        icon={<PlusOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onAdd(category.id);
        }}
      />
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
