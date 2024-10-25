import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TaskTypePartial } from '../../../../types/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  taskData: TaskTypePartial;
}

const TaskCard = ({ taskData }: TaskCardProps) => {
  const [finishedSubtasksCount, setFinishedSubtasksCount] = useState(0);

  const determineUsersText = () => {
    if (taskData.assignedUsers.length === 0) return 'No assigned users...';
    else if (taskData.assignedUsers.length === 1) return taskData.assignedUsers[0].user.name;
    else if (taskData.assignedUsers.length === 2)
      return `${taskData.assignedUsers[0].user.name} and 1 other...`;
    else
      return `${taskData.assignedUsers[0].user.name} and ${
        taskData.assignedUsers.length - 1
      } others...`;
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
    <Link to={`tasks/${taskData.id}`}>
      <div className={styles.taskCard}>
        <h3>{taskData.title}</h3>
        <div className={styles.cardContent}>
          <p className={styles.subtasksText}>
            {taskData.subtasks.length !== 0
              ? `${finishedSubtasksCount} of ${taskData.subtasks.length} subtasks`
              : 'No subtasks'}
          </p>
          <p className={styles.usersText}>
            Users: <span>{determineUsersText()}</span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default TaskCard;
