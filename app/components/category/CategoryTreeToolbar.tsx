import { Button, Badge, Space } from 'antd';
import {
  ExpandOutlined,
  CompressOutlined,
  PlusOutlined,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useTranslations } from 'next-intl';

interface CategoryToolbarProps {
  onAddRoot: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSaveChanges: () => void;
  onCancelChanges: () => void;
  pendingChangesCount: number;
  isProcessing: boolean;
  isSaving: boolean;
  hasCategories: boolean;
}

export function CategoryToolbar({
  onAddRoot,
  onExpandAll,
  onCollapseAll,
  onSaveChanges,
  onCancelChanges,
  pendingChangesCount,
  isProcessing,
  isSaving,
  hasCategories,
}: CategoryToolbarProps) {
  const t = useTranslations('categoryTree');

  return (
    <>
      <Space size="middle" wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddRoot} disabled={isProcessing}>
          {t('add')}
        </Button>

        <Button
          icon={<ExpandOutlined />}
          onClick={onExpandAll}
          disabled={isProcessing || !hasCategories}
        >
          {t('expandAll')}
        </Button>

        <Button icon={<CompressOutlined />} onClick={onCollapseAll} disabled={isProcessing}>
          {t('collapseAll')}
        </Button>

        {pendingChangesCount > 0 && (
          <>
            <Badge count={pendingChangesCount} offset={[-5, 5]}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={onSaveChanges}
                loading={isSaving}
                disabled={isProcessing && !isSaving}
              >
                {t('save')}
              </Button>
            </Badge>

            <Button icon={<UndoOutlined />} onClick={onCancelChanges} disabled={isProcessing}>
              {t('cancel')}
            </Button>
          </>
        )}
      </Space>
    </>
  );
}
