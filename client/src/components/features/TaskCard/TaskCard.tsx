import { useEffect, useState } from 'react';
import { TaskType } from '../../../types/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  taskData: TaskType;
}

const TaskCard = ({ taskData }: TaskCardProps) => {
  const [finishedSubtasksCount, setFinishedSubtasksCount] = useState(0);

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
    <div className={styles.taskCard}>
      <h3>{taskData.title}</h3>
      <p>
        {taskData.subtasks.length !== 0
          ? `${finishedSubtasksCount} of ${taskData.subtasks.length} subtasks`
          : 'No subtasks'}
      </p>
    </div>
  );
};

export default TaskCard;
