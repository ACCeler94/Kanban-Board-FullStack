import { TaskStatus, TaskTypePartial } from '../types/types';

interface getListByStatusProps {
  status: TaskStatus;
  toDos: TaskTypePartial[];
  setToDos: React.Dispatch<React.SetStateAction<TaskTypePartial[]>>;
  inProgress: TaskTypePartial[];
  setInProgress: React.Dispatch<React.SetStateAction<TaskTypePartial[]>>;
  done: TaskTypePartial[];
  setDone: React.Dispatch<React.SetStateAction<TaskTypePartial[]>>;
}
0;

export const getListByStatus = ({
  status,
  toDos,
  setToDos,
  inProgress,
  setInProgress,
  done,
  setDone,
}: getListByStatusProps) => {
  switch (status) {
    case TaskStatus.TO_DO:
      return { list: toDos, setter: setToDos };
    case TaskStatus.IN_PROGRESS:
      return { list: inProgress, setter: setInProgress };
    case TaskStatus.DONE:
      return { list: done, setter: setDone };
  }
};
