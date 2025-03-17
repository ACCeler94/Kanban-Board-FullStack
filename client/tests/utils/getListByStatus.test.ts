import { TaskStatus, TaskTypePartial } from '../../src/types/types';
import { getListByStatus } from '../../src/utils/getListByStatus';

describe('getListByStatus', () => {
  const toDos: TaskTypePartial[] = [];
  const inProgress: TaskTypePartial[] = [];
  const done: TaskTypePartial[] = [];

  const setToDos = vi.fn();
  const setInProgress = vi.fn();
  const setDone = vi.fn();

  it('should return toDos list and setToDos if passed status is TaskStatus.TO_DO', () => {
    const result = getListByStatus({
      status: TaskStatus.TO_DO,
      toDos,
      inProgress,
      done,
      setToDos,
      setInProgress,
      setDone,
    });

    expect(result).toStrictEqual({ list: toDos, setter: setToDos });
  });

  it('should return inProgress list and setInProgress if passed status is TaskStatus.IN_PROGRESS', () => {
    const result = getListByStatus({
      status: TaskStatus.IN_PROGRESS,
      toDos,
      inProgress,
      done,
      setToDos,
      setInProgress,
      setDone,
    });

    expect(result).toStrictEqual({ list: inProgress, setter: setInProgress });
  });

  it('should return done list and setDone if passed status is TaskStatus.DONE', () => {
    const result = getListByStatus({
      status: TaskStatus.DONE,
      toDos,
      inProgress,
      done,
      setToDos,
      setInProgress,
      setDone,
    });

    expect(result).toStrictEqual({ list: done, setter: setDone });
  });
});
