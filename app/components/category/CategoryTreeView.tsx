import { Tree } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import type { Category } from '@/app/types/category/category';
import { CategoryActions } from './CategoryActions';

interface CategoryTreeViewProps {
  categoryTree: Category[];
  expandedIds: Set<number>;
  modifiedCategories: Category[];
  isProcessing: boolean;
  getCategoryName: (cat: Category) => string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onDrop: TreeProps['onDrop'];
  onExpand: (id: number) => void;
  onSelect: (id: number | undefined, cat: Category | undefined) => void;
}

export function CategoryTreeView({
  categoryTree,
  expandedIds,
  modifiedCategories,
  isProcessing,
  getCategoryName,
  onEdit,
  onDelete,
  onDrop,
  onExpand,
  onSelect,
}: CategoryTreeViewProps) {
  const convertToTreeData = (cats: Category[]): DataNode[] =>
    cats.map((cat) => ({
      key: cat.id,
      title: (
        <div className="flex items-center justify-between h-12 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center flex-1 min-w-0 gap-2">
            {expandedIds.has(cat.id) ? (
              <FolderOpenOutlined className="text-blue-600 text-lg flex-shrink-0" />
            ) : (
              <FolderOutlined className="text-amber-600 text-lg flex-shrink-0" />
            )}

            <span className="truncate text-sm font-medium text-gray-800">
              {getCategoryName(cat)}
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <CategoryActions category={cat} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      ),
      children: cat.children?.length ? convertToTreeData(cat.children) : undefined,
    }));

  return (
    <Tree
      showIcon
      draggable
      blockNode
      disabled={isProcessing}
      onDrop={onDrop}
      treeData={convertToTreeData(categoryTree)}
      expandedKeys={[...expandedIds]}
      onExpand={(_, info) => onExpand(Number(info.node.key))}
      onSelect={(keys) => {
        const id = keys[0] ? Number(keys[0]) : undefined;
        const cat = modifiedCategories.find((c) => c.id === id);
        onSelect(id, cat);
      }}
    />
  );
}
