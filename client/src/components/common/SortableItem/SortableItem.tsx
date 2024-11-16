import { TaskTypePartial } from '../../../types/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  data: TaskTypePartial;
}

const SortableItem = ({ id, children, data }: SortableItemProps) => {
  const { attributes, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    // remove tabIndex from the li as the handle is responsible for the drag and drop
    <li ref={setNodeRef} style={style} key={id} {...attributes} tabIndex={-1}>
      {children}
    </li>
  );
};

export default SortableItem;
