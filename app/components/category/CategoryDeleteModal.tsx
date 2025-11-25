'use client';
import { Modal } from 'antd';
import type { Category } from '@/app/types/category/category';
import { useTranslations } from 'use-intl';

interface Props {
  category: Category | null;
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  getName: (cat: Category) => string;
}

export function CategoryDeleteModal({
  open,
  category,
  loading,
  onConfirm,
  onCancel,
  getName,
}: Props) {
  const t = useTranslations('categoryTree');

  return (
    <Modal
      title={t('confirmDeleteTitle')}
      open={open}
      okText={t('delete')}
      cancelText={t('cancel')}
      okType="danger"
      confirmLoading={loading}
      onOk={onConfirm}
      onCancel={onCancel}
    >
      <p>{t('confirmDeleteMessage', { name: category ? getName(category) : '' })}</p>
    </Modal>
  );
}
