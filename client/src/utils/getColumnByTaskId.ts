import { TaskStatus, TaskTypePartial } from '../types/types';

interface getColumnByTaskIdProps {
  taskId: string;
  toDos: TaskTypePartial[];
  inProgress: TaskTypePartial[];
  done: TaskTypePartial[];
}

export const getColumnByTaskId = ({ taskId, toDos, inProgress, done }: getColumnByTaskIdProps) => {
  if (toDos.some((task) => task.id === taskId)) return TaskStatus.TO_DO;
  if (inProgress.some((task) => task.id === taskId)) return TaskStatus.IN_PROGRESS;
  if (done.some((task) => task.id === taskId)) return TaskStatus.DONE;
  return null;
};
