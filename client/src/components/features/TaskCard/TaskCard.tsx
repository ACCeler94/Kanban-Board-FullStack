import { useEffect, useState } from 'react';
import { TaskTypePartial } from '../../../types/types';
import styles from './TaskCard.module.css';
import { Link } from 'react-router-dom';

interface TaskCardProps {
  taskData: TaskTypePartial;
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
    <Link to={`tasks/${taskData.id}`}>
      <div className={styles.taskCard}>
        <h3>{taskData.title}</h3>
        <p>
          {taskData.subtasks.length !== 0
            ? `${finishedSubtasksCount} of ${taskData.subtasks.length} subtasks`
            : 'No subtasks'}
        </p>
      </div>
    </Link>
  );
};

export default TaskCard;
