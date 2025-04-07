import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus, TaskTypePartial } from '../../../types/types';
import Droppable from '../Droppable/Droppable';
import { FaCircle } from 'react-icons/fa';
import SortableItem from '../SortableItem/SortableItem';
import TaskCard from '../../features/Tasks/TaskCard/TaskCard';
import styles from './Column.module.css';

interface ColumnProps {
  tasks: TaskTypePartial[];
  status: TaskStatus;
  label: string;
}

const Column = ({ tasks, status, label }: ColumnProps) => {
  return (
    <SortableContext
      id={status}
      items={tasks.map((task) => task.id)}
      strategy={verticalListSortingStrategy}
    >
      <Droppable id={status} className={styles.columnWrapper}>
        <div className={styles.column}>
          <div className={`${styles.columnHeaderWrapper} ${styles[status]}`}>
            <FaCircle />
            <h2 className={styles.columnHeader}>
              {label} ({tasks.length})
            </h2>
          </div>
          <ul className={styles.tasksList}>
            {tasks.map((task) => (
              <SortableItem id={task.id} key={task.id} data={task}>
                <TaskCard taskData={task} />
              </SortableItem>
            ))}
          </ul>
        </div>
      </Droppable>
    </SortableContext>
  );
};

export default Column;
