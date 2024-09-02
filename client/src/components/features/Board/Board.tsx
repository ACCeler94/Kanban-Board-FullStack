import { useParams } from 'react-router-dom';
import styles from './Board.module.css';
import { useBoardById } from '../../../API/boards';
import { validate as uuidValidate } from 'uuid';
import Loader from '../../common/BoardLoader/BoardLoader';
import Error from '../../common/Error/Error';
import { useEffect, useState } from 'react';
import { TaskStatus, TaskType } from '../../../types/types';
import { FaCircle } from 'react-icons/fa';
import TaskCard from '../TaskCard/TaskCard';

const Board = () => {
  const { id } = useParams();
  const { data: boardData, isPending, error } = useBoardById(id);
  const [toDos, setToDos] = useState<TaskType[]>([]);
  const [inProgress, setInProgress] = useState<TaskType[]>([]);
  const [done, setDone] = useState<TaskType[]>([]);

  useEffect(() => {
    if (boardData && !error && !isPending) {
      const tasksToDo: TaskType[] = [];
      const tasksInProgress: TaskType[] = [];
      const tasksDone: TaskType[] = [];

      for (const task of boardData.tasks) {
        if (task.status === TaskStatus.TO_DO) {
          tasksToDo.push(task);
        } else if (task.status === TaskStatus.IN_PROGRESS) {
          tasksInProgress.push(task);
        } else if (task.status === TaskStatus.DONE) {
          tasksDone.push(task);
        }
      }

      setToDos(tasksToDo);
      setInProgress(tasksInProgress);
      setDone(tasksDone);
    }
  }, [boardData, error, isPending]);

  if (!id || !uuidValidate(id)) {
    return <Error message='Error. Invalid board ID!' />;
  }

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return <Error message={error.message} />;
  }

  if (boardData) {
    return (
      <div className={styles.boardGrid}>
        <div className={styles.boardColumn}>
          <div className={`${styles.columnHeaderWrapper} ${styles.toDo}`}>
            <FaCircle />
            <h2 className={styles.columnHeader}>TO DO ({toDos.length})</h2>
          </div>
          <ul className={styles.tasksList}>
            {toDos.map((task) => {
              return (
                <li key={task.id}>
                  <TaskCard taskData={task} />
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.boardColumn}>
          <div className={`${styles.columnHeaderWrapper} ${styles.inProgress}`}>
            <FaCircle />
            <h2 className={styles.columnHeader}>IN PROGRESS ({inProgress.length})</h2>
          </div>
          <ul className={styles.tasksList}>
            {inProgress.map((task) => {
              return (
                <li key={task.id}>
                  <TaskCard taskData={task} />
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.boardColumn}>
          <div className={`${styles.columnHeaderWrapper} ${styles.done}`}>
            <FaCircle />
            <h2 className={styles.columnHeader}>DONE ({done.length})</h2>
          </div>
          <ul className={styles.tasksList}>
            {done.map((task) => {
              return (
                <li key={task.id}>
                  <TaskCard taskData={task} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
};

export default Board;
