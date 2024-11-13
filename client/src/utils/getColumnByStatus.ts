import { TaskStatus, TaskTypePartial } from '../types/types';

interface getColumnByStatusProps {
  status: TaskStatus;
  toDos: TaskTypePartial[];
  inProgress: TaskTypePartial[];
  done: TaskTypePartial[];
}

export const getColumnByStatus = ({ status, toDos, inProgress, done }: getColumnByStatusProps) => {
  switch (status) {
    case TaskStatus.TO_DO:
      return toDos;
    case TaskStatus.IN_PROGRESS:
      return inProgress;
    case TaskStatus.DONE:
      return done;
    default:
      return [];
  }
};
