import { useDroppable } from '@dnd-kit/core';
import React, { HTMLAttributes } from 'react';
import styles from './Droppable.module.css';

interface DroppableProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children: React.ReactNode;
  handleDragLeave?: () => void; // Add the onDragLeave prop
}

const Droppable = ({ id, children, ...props }: DroppableProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} {...props} className={isOver ? styles.isOver : ''}>
      {children}
    </div>
  );
};

export default Droppable;
