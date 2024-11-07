import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useEffect, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { Outlet, useParams } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';
import { useBoardById } from '../../../../API/boards';
import { TaskStatus, TaskTypePartial } from '../../../../types/types';
import Loader from '../../../common/BoardLoader/BoardLoader';
import Draggable from '../../../common/Draggable/Draggable';
import Droppable from '../../../common/Droppable/Droppable';
import Error from '../../../common/Error/Error';
import TaskCard from '../../Tasks/TaskCard/TaskCard';
import styles from './Board.module.css';
import { useEditTask } from '../../../../API/tasks';
import { updateLocalColumns } from '../../../../utils/updateLocalColumns';

const Board = () => {
  const { id } = useParams();
  const { data: boardData, isPending, error } = useBoardById(id);
  const [toDos, setToDos] = useState<TaskTypePartial[]>([]);
  const [inProgress, setInProgress] = useState<TaskTypePartial[]>([]);
  const [done, setDone] = useState<TaskTypePartial[]>([]);
  const [activeTask, setActiveTask] = useState<TaskTypePartial | null>(null); // Track active task for overlay

  const { mutate, isSuccess, error: editError } = useEditTask();

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  useEffect(() => {
    if (boardData && !error && !isPending) {
      const tasksToDo: TaskTypePartial[] = [];
      const tasksInProgress: TaskTypePartial[] = [];
      const tasksDone: TaskTypePartial[] = [];

      boardData.tasks.forEach((task) => {
        if (task.status === TaskStatus.TO_DO) tasksToDo.push(task);
        else if (task.status === TaskStatus.IN_PROGRESS) tasksInProgress.push(task);
        else if (task.status === TaskStatus.DONE) tasksDone.push(task);
      });

      setToDos(tasksToDo);
      setInProgress(tasksInProgress);
      setDone(tasksDone);
    }
  }, [boardData, error, isPending]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current as TaskTypePartial | undefined;
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeTask) {
      const targetStatus = event.over.id as TaskStatus;
      const previousStatus = activeTask.status;

      // Optimistically update the local state
      if (targetStatus !== previousStatus) {
        updateLocalColumns({
          task: activeTask,
          newStatus: targetStatus,
          setToDos,
          setInProgress,
          setDone,
        });
        setActiveTask({ ...activeTask, status: targetStatus });
      }

      mutate({
        taskId: activeTask.id,
        editData: { taskData: { status: targetStatus } },
        subtasksToRemove: [],
      });

      if (editError) {
        updateLocalColumns({
          task: activeTask,
          newStatus: previousStatus,
          setToDos,
          setInProgress,
          setDone,
        });
        setActiveTask(null);
      }
      // Clear the active task after mutation success
      if (isSuccess) setActiveTask(null);
    }
  };

  if (!id || !uuidValidate(id)) return <Error message='Error. Invalid board ID!' />;
  if (isPending) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.boardGrid}>
        <Droppable id={TaskStatus.TO_DO}>
          <div className={styles.boardColumn}>
            <div className={`${styles.columnHeaderWrapper} ${styles.toDo}`}>
              <FaCircle />
              <h2 className={styles.columnHeader}>TO DO ({toDos.length})</h2>
            </div>
            <ul className={styles.tasksList}>
              {toDos.map((task) => (
                <Draggable id={task.id} key={task.id} data={task}>
                  <TaskCard taskData={task} />
                </Draggable>
              ))}
            </ul>
          </div>
        </Droppable>

        <Droppable id={TaskStatus.IN_PROGRESS}>
          <div className={styles.boardColumn}>
            <div className={`${styles.columnHeaderWrapper} ${styles.inProgress}`}>
              <FaCircle />
              <h2 className={styles.columnHeader}>IN PROGRESS ({inProgress.length})</h2>
            </div>
            <ul className={styles.tasksList}>
              {inProgress.map((task) => (
                <Draggable id={task.id} key={task.id} data={task}>
                  <TaskCard taskData={task} />
                </Draggable>
              ))}
            </ul>
          </div>
        </Droppable>

        <Droppable id={TaskStatus.DONE}>
          <div className={styles.boardColumn}>
            <div className={`${styles.columnHeaderWrapper} ${styles.done}`}>
              <FaCircle />
              <h2 className={styles.columnHeader}>DONE ({done.length})</h2>
            </div>
            <ul className={styles.tasksList}>
              {done.map((task) => (
                <Draggable id={task.id} key={task.id} data={task}>
                  <TaskCard taskData={task} />
                </Draggable>
              ))}
            </ul>
          </div>
        </Droppable>

        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeTask ? <TaskCard taskData={activeTask} /> : null}
        </DragOverlay>

        <Outlet />
      </div>
    </DndContext>
  );
};

export default Board;
