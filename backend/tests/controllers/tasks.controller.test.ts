import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../prisma/__mocks__/prisma';
import { Board, Subtask, Task, TaskStatus, User, UserOnBoard } from '@prisma/client';
import TasksController from '../../controllers/tasks.controller';
import { Session, SessionData } from 'express-session';

vi.mock('../../prisma/prisma.ts');

// task operations can be performed by any user assigned to the board - this condition is checked by checkBoardAssignment middleware
describe('TasksController', () => {
  const userId = '83d9930a-bdbe-4d70-9bb3-540910cb7ff4';

  const mockTask: Task = {
    id: '1',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    updatedAt: new Date('2024-06-12 16:04:21.778'),
    title: 'Task one',
    desc: 'this is task one',
    boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
    authorId: userId,
    status: TaskStatus.TO_DO,
  };

  const mockSubtask: Subtask = {
    id: '2',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    updatedAt: new Date('2024-06-12 16:04:21.778'),
    taskId: '1',
    desc: 'Test subtask',
    finished: false,
  };

  const mockTaskWithSubtask: Task & { subtasks: Subtask[] } = {
    ...mockTask,
    subtasks: [mockSubtask],
  };

  const mockBoard: Board = {
    id: '1',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    title: 'Mock Board Title',
    authorId: '123',
  };

  const mockUser: User = {
    id: '3713d558-d107-4c4b-b651-a99676e4315e',
    name: 'John Smith',
    email: 'john@example.com',
    auth0Sub: 'auth0|123456789',
  };

  const mockUserOnBoard: UserOnBoard = {
    userId: mockUser.id,
    boardId: mockBoard.id,
  };

  describe('getById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: {
          taskId: '1',
        },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and the task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskWithSubtask);

      await TasksController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          author: { select: { id: true, name: true } },
          assignedUsers: { select: { user: { select: { id: true, name: true } } } },
          subtasks: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTaskWithSubtask);
    });

    it('should return 404 status and an error message if task was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await TasksController.getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.task.findUnique.mockRejectedValue(error);

      await TasksController.getById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createTask', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: {
          taskData: {
            title: 'Task one',
            desc: 'this is task one',
            boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
          },
        },
        session: { userId } as Session & Partial<SessionData>,
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and created task with subtasks if both task and subtask data was provided', async () => {
      req = {
        body: {
          taskData: {
            title: 'Task one',
            desc: 'this is task one',
            boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
          },
          subtaskData: [{ desc: 'Test subtask' }],
        },
        session: { userId } as Session & Partial<SessionData>,
      };
      prisma.$transaction.mockImplementation(async (fn) => {
        const result = await fn(prisma);
        return result;
      });

      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);
      prisma.task.create.mockResolvedValue(mockTask);
      prisma.task.findUnique.mockResolvedValue(mockTaskWithSubtask);

      await TasksController.createTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Task one',
          desc: 'this is task one',
          authorId: req.session!.userId,
          boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
        },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.subtask.createMany).toHaveBeenCalledWith({
        data: [
          {
            desc: 'Test subtask',
            taskId: mockTaskWithSubtask.id,
            finished: false,
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTaskWithSubtask);
    });

    it('should return 201 status and created task if only task data was provided (no subtaskData)', async () => {
      const mockTaskWithEmptySubtask = { ...mockTask, subtasks: [] };

      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);
      prisma.task.create.mockResolvedValue(mockTask);
      prisma.task.findUnique.mockResolvedValue(mockTaskWithEmptySubtask); // in the method a full task with subtasks is fetched regardless if subtasks were updated

      await TasksController.createTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Task one',
          desc: 'this is task one',
          authorId: req.session!.userId,
          boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTaskWithEmptySubtask);
    });

    it('should return 500 status and error message if task was created but subtask transaction failed', async () => {
      req = {
        body: {
          taskData: {
            title: 'Task one',
            desc: 'this is task one',
            boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
          },
          subtaskData: [{ desc: 'Test subtask' }],
        },
        session: { userId } as Session & Partial<SessionData>,
      };
      prisma.$transaction.mockImplementation(async (fn) => {
        const result = await fn(prisma);
        return result;
      });

      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);
      prisma.task.create.mockResolvedValue(mockTaskWithSubtask);
      const subtaskError = new Error('Subtask creation failed');
      prisma.subtask.createMany.mockRejectedValue(subtaskError);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create some or all subtasks. The main task was created successfully.',
      });
    });

    it('should return 400 status and error message if task data is invalid', async () => {
      req.body = undefined;

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data.' });
    });

    it('should return 404 status and error message if board where the task is being created does not exist', async () => {
      prisma.board.findUnique.mockResolvedValue(null);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
    });

    it('should return a 403 status code and an error message if the task author is not assigned to the board where the task is being created.', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.userOnBoard.findUnique.mockResolvedValue(null);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access forbidden! User is not assigned to the board.',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);
      const error = new Error('Database error');
      prisma.task.create.mockRejectedValue(error);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addUserToTask', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    const mockTaskExtended: Task & { board: Board & { users: { userId: string }[] } } = {
      id: '1',
      createdAt: new Date('2024-06-12 16:04:21.778'),
      updatedAt: new Date('2024-06-12 16:04:21.778'),
      title: 'Task one',
      desc: 'this is task one',
      boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
      authorId: userId,
      status: TaskStatus.TO_DO,
      board: {
        id: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
        createdAt: new Date('2024-06-12 16:04:21.778'),
        title: 'Mock Board Title',
        authorId: '123',
        users: [{ userId: '3713d558-d107-4c4b-b651-a99676e4315e' }],
      },
    };

    beforeEach(() => {
      req = {
        params: {
          taskId: mockTask.id,
          userId: mockUser.id,
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and success message if the user was added to the task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskExtended);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnTask.findUnique.mockResolvedValue(null);
      prisma.userOnTask.create.mockResolvedValue({ userId: mockUser.id, taskId: mockTask.id });

      await TasksController.addUserToTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.userOnTask.create).toHaveBeenCalledWith({
        data: { userId: req.params!.userId, taskId: req.params!.taskId },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User assigned to the task!' });
    });

    it('should return 404 status and error message if task was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
    });

    it('should return 404 status and error message if user was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskExtended);
      prisma.user.findUnique.mockResolvedValue(null);

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should return 403 status and error message if added user is not assigned to the board', async () => {
      const mockTaskWithoutUser: Task & { board: Board & { users: { userId: string }[] } } = {
        ...mockTaskExtended,
        board: {
          ...mockTaskExtended.board,
          users: [], // Empty users array indicating no user assigned to the board
        },
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.task.findUnique.mockResolvedValue(mockTaskWithoutUser);

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access forbidden! User is not assigned to the board.',
      });
    });

    it('should return 409 status and error message if user is already assigned to the task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskExtended);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnTask.findUnique.mockResolvedValue({ userId: mockUser.id, taskId: mockTask.id });

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'User is already added to the task!' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.task.findUnique.mockRejectedValue(error);

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('editTask', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: {
          taskId: '1',
        },
        body: {
          taskData: { title: 'Task One edited' }, // one property is enough as the method allows partial updates
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and success message if task was updated - only taskData was provided', async () => {
      const mockTaskUpdated = { ...mockTask, title: 'Task One edited' };
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(mockTaskUpdated);

      await TasksController.editTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: req.params!.taskId },
        data: {
          ...mockTask,
          title: 'Task One edited',
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task updated!' });
    });

    it('should return 200 status and success message if task was updated with new subtask', async () => {
      req.body = {
        taskData: {},
        subtaskData: [{ desc: 'Test subtask' }],
      };
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.subtask.create.mockResolvedValue({ ...mockSubtask, taskId: mockTask.id });

      await TasksController.editTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.subtask.create).toHaveBeenCalledWith({
        data: {
          taskId: mockTask.id,
          desc: mockSubtask.desc,
          finished: false,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task updated!' });
    });

    it('should return 400 status and error message if provided data is not in a valid format', async () => {
      req.body = { subtaskData: { title: 1 } }; // object instead of array - zod validation fails

      await TasksController.editTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data' });
    });

    it('should return 400 status and error message if task data is an empty object', async () => {
      req.body = {};

      await TasksController.editTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Updated task data cannot be empty!' });
    });

    it('should return 404 status and error message if task was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await TasksController.editTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.task.findUnique.mockRejectedValue(error);

      await TasksController.editTask(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteTask', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: {
          taskId: '1',
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and success message if task was successfully deleted', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.delete.mockResolvedValue(mockTask);

      await TasksController.deleteTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: req.params!.taskId } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Task successfully removed!' });
    });

    it('should return 404 status and error message if task was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await TasksController.deleteTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.task.findUnique.mockRejectedValue(error);

      await TasksController.deleteTask(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUserFromTask ', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: {
          taskId: '1',
          userId: '3713d558-d107-4c4b-b651-a99676e4315e',
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and success message if user was removed from the task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnTask.findUnique.mockResolvedValue({
        userId: '3713d558-d107-4c4b-b651-a99676e4315e',
        taskId: '1',
      });
      prisma.userOnTask.delete.mockResolvedValue({
        userId: '3713d558-d107-4c4b-b651-a99676e4315e',
        taskId: '1',
      });

      await TasksController.deleteUserFromTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.userOnTask.delete).toHaveBeenCalledWith({
        where: {
          userId_taskId: {
            userId: req.params!.userId,
            taskId: req.params!.taskId,
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User removed from the task!' });
    });

    it('should return 404 status and error message if the task was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await TasksController.deleteUserFromTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
    });

    it('should return 404 status and error message if the user was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.user.findUnique.mockResolvedValue(null);

      await TasksController.deleteUserFromTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found...' });
    });

    it('should return 400 status and error message if the user was not assigned to the task in the first place', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnTask.findUnique.mockResolvedValue(null);

      await TasksController.deleteUserFromTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User is not assigned to this task!' });
    });

    it('should call next with an error if an exception occurs', async () => {
      const error = new Error('Database error');
      prisma.task.findUnique.mockRejectedValue(error);

      await TasksController.deleteUserFromTask(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
