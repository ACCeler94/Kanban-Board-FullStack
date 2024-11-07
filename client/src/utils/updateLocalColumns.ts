import { TaskStatus, TaskTypePartial } from '../types/types';

export const updateLocalColumns = ({
  task,
  newStatus,
  setToDos,
  setInProgress,
  setDone,
}: {
  task: TaskTypePartial;
  newStatus: TaskStatus;
  setToDos: React.Dispatch<React.SetStateAction<TaskTypePartial[]>>;
  setInProgress: React.Dispatch<React.SetStateAction<TaskTypePartial[]>>;
  setDone: React.Dispatch<React.SetStateAction<TaskTypePartial[]>>;
}) => {
  // Move task between local state columns
  if (newStatus === TaskStatus.TO_DO) {
    setToDos((prev) => [...prev, { ...task, status: newStatus }]);
    if (task.status === TaskStatus.IN_PROGRESS)
      setInProgress((prev) => prev.filter((t) => t.id !== task.id));
    else if (task.status === TaskStatus.DONE)
      setDone((prev) => prev.filter((t) => t.id !== task.id));
  }

  if (newStatus === TaskStatus.IN_PROGRESS) {
    setInProgress((prev) => [...prev, { ...task, status: newStatus }]);
    if (task.status === TaskStatus.TO_DO) setToDos((prev) => prev.filter((t) => t.id !== task.id));
    else if (task.status === TaskStatus.DONE)
      setDone((prev) => prev.filter((t) => t.id !== task.id));
  }

  if (newStatus === TaskStatus.DONE) {
    setDone((prev) => [...prev, { ...task, status: newStatus }]);
    if (task.status === TaskStatus.TO_DO) setToDos((prev) => prev.filter((t) => t.id !== task.id));
    else if (task.status === TaskStatus.IN_PROGRESS)
      setInProgress((prev) => prev.filter((t) => t.id !== task.id));
  }
};
