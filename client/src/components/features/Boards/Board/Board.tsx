import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableContext } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { Outlet, useParams } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';
import { useBoardById } from '../../../../API/boards';
import { useEditTask } from '../../../../API/tasks';
import { TaskStatus, TaskTypePartial } from '../../../../types/types';
import { getColumnByStatus } from '../../../../utils/getColumnByStatus';
import { updateLocalColumns } from '../../../../utils/updateLocalColumns';
import Loader from '../../../common/BoardLoader/BoardLoader';
import Droppable from '../../../common/Droppable/Droppable';
import Error from '../../../common/Error/Error';
import SortableItem from '../../../common/SortableItem/SortableItem';
import TaskCard from '../../Tasks/TaskCard/TaskCard';
import styles from './Board.module.css';

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;
    const overId = over.id;

    // Only proceed if the task is not the one being hovered over
    if (activeTask && activeTask.id !== overId) {
      let columnState;
      let setColumnState;

      // Choose the appropriate column and state setter based on the activeTask's status
      switch (activeTask.status) {
        case TaskStatus.TO_DO:
          columnState = toDos;
          setColumnState = setToDos;
          break;
        case TaskStatus.IN_PROGRESS:
          columnState = inProgress;
          setColumnState = setInProgress;
          break;
        case TaskStatus.DONE:
          columnState = done;
          setColumnState = setDone;
          break;
        default:
          return;
      }

      // Find the index of the task being dragged over and the task being dragged
      const overIndex = columnState.findIndex((task) => task.id === overId);
      const activeIndex = columnState.findIndex((task) => task.id === activeTask.id);

      // Only update if the task's position has changed
      if (activeIndex !== overIndex) {
        const updatedColumn = [...columnState];
        const [movedTask] = updatedColumn.splice(activeIndex, 1);
        updatedColumn.splice(overIndex, 0, movedTask);

        // Update the state with the new column order
        setColumnState(updatedColumn);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over && activeTask) {
      const targetStatus = event.over.id as TaskStatus;
      const previousStatus = activeTask.status;

      // Skip if the task is dropped in the same column and same position
      if (targetStatus === previousStatus) {
        const targetColumn = getColumnByStatus({ status: targetStatus, toDos, inProgress, done });
        const overIndex = targetColumn.findIndex((task) => task.id === event.over?.id);
        const activeIndex = targetColumn.findIndex((task) => task.id === activeTask.id);

        // Do nothing if it's the same position
        if (overIndex === activeIndex) return;
      }

      // Optimistically update the task status in the local state
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

      // Proceed with the backend mutation
      // mutate({
      //   taskId: activeTask.id,
      //   editData: { taskData: { status: targetStatus } },
      //   subtasksToRemove: [],
      // });

      // Rollback if there’s an error
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

      // Clear active task after success
      if (isSuccess) {
        setActiveTask(null);
      }
    }
  };

  if (!id || !uuidValidate(id)) return <Error message='Error. Invalid board ID!' />;
  if (isPending) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.boardGrid}>
        <SortableContext id={TaskStatus.TO_DO} items={toDos.map((task) => task.id)}>
          <Droppable id={TaskStatus.TO_DO}>
            <div className={styles.boardColumn}>
              <div className={`${styles.columnHeaderWrapper} ${styles.toDo}`}>
                <FaCircle />
                <h2 className={styles.columnHeader}>TO DO ({toDos.length})</h2>
              </div>
              <ul className={styles.tasksList}>
                {toDos.map((task) => (
                  <SortableItem id={task.id} key={task.id} data={task}>
                    <TaskCard taskData={task} />
                  </SortableItem>
                ))}
              </ul>
            </div>
          </Droppable>
        </SortableContext>

        <SortableContext id={TaskStatus.IN_PROGRESS} items={inProgress.map((task) => task.id)}>
          <Droppable id={TaskStatus.IN_PROGRESS}>
            <div className={styles.boardColumn}>
              <div className={`${styles.columnHeaderWrapper} ${styles.inProgress}`}>
                <FaCircle />
                <h2 className={styles.columnHeader}>IN PROGRESS ({inProgress.length})</h2>
              </div>
              <ul className={styles.tasksList}>
                {inProgress.map((task) => (
                  <SortableItem id={task.id} key={task.id} data={task}>
                    <TaskCard taskData={task} />
                  </SortableItem>
                ))}
              </ul>
            </div>
          </Droppable>
        </SortableContext>

        <SortableContext id={TaskStatus.DONE} items={done.map((task) => task.id)}>
          <Droppable id={TaskStatus.DONE}>
            <div className={styles.boardColumn}>
              <div className={`${styles.columnHeaderWrapper} ${styles.done}`}>
                <FaCircle />
                <h2 className={styles.columnHeader}>DONE ({done.length})</h2>
              </div>
              <ul className={styles.tasksList}>
                {done.map((task) => (
                  <SortableItem id={task.id} key={task.id} data={task}>
                    <TaskCard taskData={task} />
                  </SortableItem>
                ))}
              </ul>
            </div>
          </Droppable>
        </SortableContext>

        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeTask ? <TaskCard taskData={activeTask} /> : null}
        </DragOverlay>

        <Outlet />
      </div>
    </DndContext>
  );
};

export default Board;
