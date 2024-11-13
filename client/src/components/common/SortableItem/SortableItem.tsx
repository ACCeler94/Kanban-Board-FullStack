import { CSSProperties } from 'react';
import { TaskTypePartial } from '../../../types/types';
import { useSortable } from '@dnd-kit/sortable';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  data: TaskTypePartial;
}

const SortableItem = ({ id, children, data }: SortableItemProps) => {
  const { attributes, setNodeRef, isDragging } = useSortable({
    id,
    data,
  });
  const style: CSSProperties = {
    visibility: isDragging ? 'hidden' : 'visible', // Use visibility instead of opacity
    pointerEvents: isDragging ? 'none' : undefined, // Prevent interaction while dragging
  };

  return (
    // remove tabIndex from the li as the handle is responsible for the drag and drop
    <li ref={setNodeRef} style={style} key={id} {...attributes} tabIndex={-1}>
      {children}
    </li>
  );
};

export default SortableItem;
