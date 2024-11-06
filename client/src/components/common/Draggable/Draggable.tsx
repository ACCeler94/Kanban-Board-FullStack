import { useDraggable } from '@dnd-kit/core';
import { CSSProperties } from 'react';
import { TaskTypePartial } from '../../../types/types';

interface DraggableProps {
  id: string;
  children: React.ReactNode;
  data: TaskTypePartial;
}

const Draggable = ({ id, children, data }: DraggableProps) => {
  const { attributes, setNodeRef, isDragging } = useDraggable({
    id,
    data,
  });
  const style: CSSProperties = {
    opacity: isDragging ? 0 : 1, // Hide the original item during dragging
    pointerEvents: isDragging ? 'none' : undefined, // Prevent interaction while dragging
  };

  return (
    // remove tabIndex from the li as the handle is responsible for the drag and drop
    <li ref={setNodeRef} style={style} key={id} {...attributes} tabIndex={-1}>
      {children}
    </li>
  );
};

export default Draggable;
