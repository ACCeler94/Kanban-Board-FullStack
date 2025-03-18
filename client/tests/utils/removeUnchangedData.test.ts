import { DiffTaskData, EditTaskData, TaskStatus, TaskType } from '../../src/types/types';
import { removeUnchangedData } from '../../src/utils/removeUnchangedData';
import { db } from '../mocks/db';

describe('removeUnchangedData', () => {
  const oldTaskData: TaskType = db.task.create();
  const subtask1 = db.subtask.create();
  const subtask2 = db.subtask.create();
  const oldTaskWithSubtasks = { ...oldTaskData, subtasks: [subtask1, subtask2] };

  it('should return an empty diffData object if no changes are made', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: oldTaskWithSubtasks.desc,
        status: oldTaskWithSubtasks.status,
      },
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };

    const diffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(diffData).toEqual({ taskData: {}, subtaskData: [] });
  });

  it('should detect changes in task title', () => {
    const formData: EditTaskData = {
      taskData: {
        title: 'abc',
        desc: oldTaskWithSubtasks.desc,
        status: oldTaskWithSubtasks.status,
      },
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = { taskData: { title: 'abc' }, subtaskData: [] };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should detect changes in task description', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: 'new desc',
        status: oldTaskWithSubtasks.status,
      },
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = {
      taskData: { desc: 'new desc' },
      subtaskData: [],
    };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should detect changes in task status', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: oldTaskWithSubtasks.desc,
        status: TaskStatus.DONE,
      },
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = {
      taskData: { status: TaskStatus.DONE },
      subtaskData: [],
    };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should detect changes in all task fields', () => {
    const formData: EditTaskData = {
      taskData: {
        title: 'New Title',
        desc: 'New Description',
        status: TaskStatus.DONE,
      },
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = {
      taskData: { title: 'New Title', desc: 'New Description', status: TaskStatus.DONE },
      subtaskData: [],
    };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should detect changes in a single subtask description', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: oldTaskWithSubtasks.desc,
        status: oldTaskWithSubtasks.status,
      },
      subtaskData: [
        { id: subtask1.id, desc: 'new subtask 1 description', finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = {
      taskData: {},
      subtaskData: [{ id: subtask1.id, desc: 'new subtask 1 description', finished: false }],
    };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should detect changes in multiple subtask descriptions', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: oldTaskWithSubtasks.desc,
        status: oldTaskWithSubtasks.status,
      },
      subtaskData: [
        { id: subtask1.id, desc: 'new subtask 1 description', finished: false },
        { id: subtask2.id, desc: 'new subtask 2 description', finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = {
      taskData: {},
      subtaskData: [
        { id: subtask1.id, desc: 'new subtask 1 description', finished: false },
        { id: subtask2.id, desc: 'new subtask 2 description', finished: false },
      ],
    };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });
  it('should detect a new subtask', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: oldTaskWithSubtasks.desc,
        status: oldTaskWithSubtasks.status,
      },
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
        { id: '1', desc: 'abc', finished: false },
      ],
    };

    const expectedDiffData: DiffTaskData = {
      taskData: {},
      subtaskData: [{ id: '1', desc: 'abc', finished: false }],
    };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should return formatted object if taskData and subtaskData is empty', () => {
    const formData: EditTaskData = {
      taskData: {},
      subtaskData: [],
    };

    const expectedDiffData: DiffTaskData = { taskData: {}, subtaskData: [] };
    const actualDiffData = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(actualDiffData).toEqual(expectedDiffData);
  });

  it('should return formatted object if taskData is missing', () => {
    const formData: EditTaskData = {
      subtaskData: [
        { id: subtask1.id, desc: subtask1.desc, finished: false },
        { id: subtask2.id, desc: subtask2.desc, finished: false },
      ],
    };
    const expectedDiffData: DiffTaskData = { taskData: {}, subtaskData: [] };
    const result = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(result).toEqual(expectedDiffData);
  });

  it('should return formatted object if subtaskData is missing', () => {
    const formData: EditTaskData = {
      taskData: {
        title: oldTaskWithSubtasks.title,
        desc: oldTaskWithSubtasks.desc,
        status: oldTaskWithSubtasks.status,
      },
    };
    const expectedDiffData: DiffTaskData = { taskData: {}, subtaskData: [] };
    const result = removeUnchangedData(formData, oldTaskWithSubtasks);
    expect(result).toEqual(expectedDiffData);
  });
});
