import { TaskStatus, TaskTypePartial } from '../../src/types/types';
import { getColumnByTaskId } from '../../src/utils/getColumnByTaskId';
import { db } from '../mocks/db';

describe('getColumnByTaskId', () => {
  const toDos: TaskTypePartial[] = [];
  const inProgress: TaskTypePartial[] = [];
  const done: TaskTypePartial[] = [];

  const todoTask = db.task.create();
  const inProgressTask = db.task.create({ status: TaskStatus.IN_PROGRESS });
  const doneTask = db.task.create({ status: TaskStatus.DONE });

  beforeAll(() => {
    toDos.push(todoTask);
    inProgress.push(inProgressTask);
    done.push(doneTask);
  });

  it('should return "TO_DO" for an id of a task in todos array', () => {
    const result = getColumnByTaskId({ taskId: toDos[0].id, toDos, inProgress, done });

    expect(result).toBe('TO_DO');
  });

  it('should return "IN_PROGRESS" for an id of a task in inProgress array', () => {
    const result = getColumnByTaskId({ taskId: inProgress[0].id, toDos, inProgress, done });

    expect(result).toBe('IN_PROGRESS');
  });

  it('should return "DONE" for an id of a task in done array', () => {
    const result = getColumnByTaskId({ taskId: done[0].id, toDos, inProgress, done });

    expect(result).toBe('DONE');
  });

  it('should return null if task id is not found', () => {
    const result = getColumnByTaskId({ taskId: '123', toDos, inProgress, done });

    expect(result).toBe(null);
  });
});
