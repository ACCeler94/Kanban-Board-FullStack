import { useDroppable } from '@dnd-kit/core';
import React, { HTMLAttributes } from 'react';

interface DroppableProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children: React.ReactNode;
  handleDragLeave?: () => void; // Add the onDragLeave prop
}

const Droppable = ({ id, children, ...props }: DroppableProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} {...props}>
      {children}
    </div>
  );
};

export default Droppable;
