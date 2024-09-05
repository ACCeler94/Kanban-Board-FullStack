import { useEffect, useState } from 'react';
import { TaskTypePartial } from '../../../types/types';
import TaskModal from '../TaskModal/TaskModal';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  taskData: TaskTypePartial;
}

const TaskCard = ({ taskData }: TaskCardProps) => {
  const [finishedSubtasksCount, setFinishedSubtasksCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = (event: object, reason: string) => {
    if (reason === 'escapeKeyDown' || reason === 'backdropClick') return;

    setIsOpen(false);
  };

  useEffect(() => {
    if (taskData.subtasks.length !== 0) {
      let counter = 0;
      for (const subtask of taskData.subtasks) {
        if (subtask.finished) counter++;
      }
      setFinishedSubtasksCount(counter);
    }
  }, [taskData.subtasks]);

  return (
    <>
      <div className={styles.taskCard} onClick={() => setIsOpen(true)}>
        <h3>{taskData.title}</h3>
        <p>
          {taskData.subtasks.length !== 0
            ? `${finishedSubtasksCount} of ${taskData.subtasks.length} subtasks`
            : 'No subtasks'}
        </p>
      </div>
      {
        // conditionally render modal to avoid unnecessary task data fetching - it fetches task data on mount
        isOpen ? (
          <TaskModal
            isOpen={isOpen}
            handleClose={handleClose}
            setIsOpen={setIsOpen}
            taskId={taskData.id}
          />
        ) : null
      }
    </>
  );
};

export default TaskCard;
