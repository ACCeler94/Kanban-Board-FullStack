import { useDroppable } from '@dnd-kit/core';
import React, { HTMLAttributes } from 'react';

interface DroppableProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children: React.ReactNode;
  handleDragLeave?: () => void;
  className: string;
}

const Droppable = ({ id, children, className, ...props }: DroppableProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} {...props} className={className}>
      {children}
    </div>
  );
};

export default Droppable;
