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
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { Outlet, useParams } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';
import { useBoardById } from '../../../../API/boards';
import { useEditTask } from '../../../../API/tasks';
import { TaskStatus, TaskTypePartial } from '../../../../types/types';
import { getColumnByTaskId } from '../../../../utils/getColumnByTaskId';
import { getListByStatus } from '../../../../utils/getListByStatus';
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
    const { over, active } = event;
    if (!over) return;

    const activeContainer = getColumnByTaskId({
      toDos,
      inProgress,
      done,
      taskId: active.id as string,
    });

    let overContainer: TaskStatus | null = null;

    // Check if 'over.id' is a column or a task
    if (
      over.id === TaskStatus.TO_DO ||
      over.id === TaskStatus.IN_PROGRESS ||
      over.id === TaskStatus.DONE
    ) {
      overContainer = over.id as TaskStatus; // It's a column
    } else {
      overContainer = getColumnByTaskId({
        toDos,
        inProgress,
        done,
        taskId: over.id as string,
      });
    }

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    const { list: activeItems, setter: setActiveItems } = getListByStatus({
      status: activeContainer,
      toDos,
      setToDos,
      inProgress,
      setInProgress,
      done,
      setDone,
    });
    const { list: overItems, setter: setOverItems } = getListByStatus({
      status: overContainer,
      toDos,
      setToDos,
      inProgress,
      setInProgress,
      done,
      setDone,
    });

    const activeIndex = activeItems.findIndex((item) => item.id === active.id);

    // If hovering over a column (not a task), place at the end of that column
    const overIndex =
      over.id === overContainer
        ? overItems.length
        : overItems.findIndex((item) => item.id === over.id);

    setActiveItems((prevState) => prevState.filter((task) => task.id !== active.id));
    setOverItems((prevState) => {
      return [
        ...prevState.slice(0, overIndex),
        activeItems[activeIndex],
        ...prevState.slice(overIndex, prevState.length),
      ];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = getColumnByTaskId({
      toDos,
      inProgress,
      done,
      taskId: active.id as string,
    });

    let overContainer: TaskStatus | null = null;

    if (
      over.id === TaskStatus.TO_DO ||
      over.id === TaskStatus.IN_PROGRESS ||
      over.id === TaskStatus.DONE
    ) {
      overContainer = over.id as TaskStatus;
    } else {
      overContainer = getColumnByTaskId({
        toDos,
        inProgress,
        done,
        taskId: over.id as string,
      });
    }

    if (!activeContainer || !overContainer) return;

    const { list: activeItems, setter: setActiveItems } = getListByStatus({
      status: activeContainer,
      toDos,
      setToDos,
      inProgress,
      setInProgress,
      done,
      setDone,
    });

    const { list: overItems, setter: setOverItems } = getListByStatus({
      status: overContainer,
      toDos,
      setToDos,
      inProgress,
      setInProgress,
      done,
      setDone,
    });

    const activeIndex = activeItems.findIndex((item) => item.id === active.id);
    const overIndex =
      over.id === overContainer
        ? overItems.length
        : overItems.findIndex((item) => item.id === over.id);

    if (activeContainer === overContainer && activeIndex !== overIndex) {
      setOverItems((prevState) => arrayMove(prevState, activeIndex, overIndex));
    } else if (activeContainer !== overContainer) {
      setActiveItems((prevState) => prevState.filter((task) => task.id !== active.id));
      setOverItems((prevState) => {
        return [
          ...prevState.slice(0, overIndex),
          activeItems[activeIndex],
          ...prevState.slice(overIndex, prevState.length),
        ];
      });

      // Perform mutation to update task status in the backend
      // mutate({ id: active.id, status: overContainer });
    }

    setActiveTask(null);
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
        <SortableContext
          id={TaskStatus.TO_DO}
          items={toDos.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
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

        <SortableContext
          id={TaskStatus.IN_PROGRESS}
          items={inProgress.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
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

        <SortableContext
          id={TaskStatus.DONE}
          items={done.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
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
