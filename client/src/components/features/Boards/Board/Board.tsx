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
import { arrayMove } from '@dnd-kit/sortable';
import { Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { validate as uuidValidate } from 'uuid';
import { useBoardById } from '../../../../API/boards';
import { useEditTask } from '../../../../API/tasks';
import { EditTaskData, TaskStatus, TaskTypePartial } from '../../../../types/types';
import { getColumnByTaskId } from '../../../../utils/getColumnByTaskId';
import { getListByStatus } from '../../../../utils/getListByStatus';
import Loader from '../../../common/BoardLoader/BoardLoader';
import Column from '../../../common/Column/Column';
import Error from '../../../common/Error/Error';
import LoadingOverlay from '../../../common/LoadingOverlay/LoadingOverlay';
import TaskCard from '../../Tasks/TaskCard/TaskCard';
import styles from './Board.module.css';

const Board = () => {
  const { id } = useParams();
  const { data: boardData, isPending, error, isFetching } = useBoardById(id);
  const [toDos, setToDos] = useState<TaskTypePartial[]>([]);
  const [inProgress, setInProgress] = useState<TaskTypePartial[]>([]);
  const [done, setDone] = useState<TaskTypePartial[]>([]);
  const [activeTask, setActiveTask] = useState<TaskTypePartial | null>(null); // Track active task for overlay
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, error: editError, isPending: isEditPending } = useEditTask();

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

  // show edit error alert for 5 seconds
  useEffect(() => {
    if (editError) setShowErrorAlert(true);
    const timeout = setTimeout(() => {
      setShowErrorAlert(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [editError]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current as TaskTypePartial | undefined;
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    if (!over) return;

    // Disable scroll snap on drag start to prevent flickering when moving between columns
    const boardGrid = document.querySelector(`.${styles.boardGrid}`);
    boardGrid?.classList.add(styles.noSnap);

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

    if (!overContainer) return;

    const { list: overItems, setter: setOverItems } = getListByStatus({
      status: overContainer,
      toDos,
      setToDos,
      inProgress,
      setInProgress,
      done,
      setDone,
    });

    const activeIndex = overItems.findIndex((item) => item.id === active.id); // active item is already added to the overItems in dragOverHandler
    let overIndex;

    if (over.id === overContainer) {
      if (overItems.length > 0) {
        overIndex = overItems.length - 1;
      } else overIndex = overItems.length;
    } else {
      overIndex = overItems.findIndex((item) => item.id === over.id);
    }

    setOverItems((prevState) => arrayMove(prevState, activeIndex, overIndex));

    // when status was changed
    if (activeTask!.status !== overContainer) {
      const changedData: EditTaskData = { taskData: {} };
      changedData.taskData!.status = overContainer;
      changedData.taskData!.order = overIndex;

      mutate({ taskId: activeTask!.id, editData: changedData });
      // when only order was changed
    } else if (activeTask!.status === overContainer && activeTask!.order !== overIndex) {
      mutate({ taskId: activeTask!.id, editData: { taskData: { order: overIndex } } });
    }
    setActiveTask(null);

    // Re-enable scroll snap on drag end
    const boardGrid = document.querySelector(`.${styles.boardGrid}`);
    boardGrid?.classList.remove(styles.noSnap);
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
      {showErrorAlert && editError ? (
        <Alert
          severity='error'
          variant='filled'
          onClose={() => {
            setShowErrorAlert(false);
          }}
        >
          {editError.message}
        </Alert>
      ) : (
        ''
      )}
      <div className={styles.boardGrid}>
        <Column tasks={toDos} status={TaskStatus.TO_DO} label={'TO DO'} />
        <Column tasks={inProgress} status={TaskStatus.IN_PROGRESS} label={'IN PROGRESS'} />
        <Column tasks={done} status={TaskStatus.DONE} label={'DONE'} />

        <DragOverlay className={styles.dragOverlay}>
          {activeTask ? <TaskCard taskData={activeTask} /> : null}
        </DragOverlay>
        {
          // Loading overlay added to prevent drag and dropping tasks while the data is refreshing to avoid inconsistencies
        }
        {isEditPending || isFetching ? <LoadingOverlay /> : null}

        <Outlet />
      </div>
    </DndContext>
  );
};

export default Board;
