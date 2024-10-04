import { useEffect, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { Outlet, useParams } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';
import { useBoardById } from '../../../API/boards';
import { TaskStatus, TaskTypePartial } from '../../../types/types';
import Loader from '../../common/BoardLoader/BoardLoader';
import Error from '../../common/Error/Error';
import TaskCard from '../TaskCard/TaskCard';
import styles from './Board.module.css';

const Board = () => {
  const { id } = useParams();
  const { data: boardData, isPending, error } = useBoardById(id);
  const [toDos, setToDos] = useState<TaskTypePartial[]>([]);
  const [inProgress, setInProgress] = useState<TaskTypePartial[]>([]);
  const [done, setDone] = useState<TaskTypePartial[]>([]);

  useEffect(() => {
    if (boardData && !error && !isPending) {
      const tasksToDo: TaskTypePartial[] = [];
      const tasksInProgress: TaskTypePartial[] = [];
      const tasksDone: TaskTypePartial[] = [];

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
        <Outlet />
      </div>
    );
  }
};

export default Board;
