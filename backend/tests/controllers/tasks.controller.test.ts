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
    order: 0,
  };

  const mockSubtask: Subtask = {
    id: '1dac7ee4-88a1-45a7-b745-64121fdff258',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    updatedAt: new Date('2024-06-12 16:04:21.778'),
    taskId: '1',
    desc: 'Test subtask',
    finished: false,
    order: 0,
  };

  const mockTaskWithSubtask: Task & { subtasks: Subtask[]; assignedUsers: [] } = {
    ...mockTask,
    subtasks: [mockSubtask],
    assignedUsers: [],
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
    picture:
      'lh3_googleusercontent_com_a_ACg8ocJnKucGUckPYzMgMqRABe7_QgIIPUX_caPK0rURrDAyrrNwaw_s96_c.png',
  };
  const mockCreatedAt: Date = new Date('2024-06-12 16:04:21.778');

  const mockUserOnBoard: UserOnBoard = {
    userId: mockUser.id,
    boardId: mockBoard.id,
    createdAt: mockCreatedAt,
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
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedUsers: {
            orderBy: {
              createdAt: 'asc',
            },
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  picture: true,
                },
              },
            },
          },
          subtasks: {
            orderBy: {
              order: 'asc', // Ensures subtasks are ordered correctly
            },
          },
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
            status: TaskStatus.TO_DO,
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
            status: TaskStatus.TO_DO,
          },
          subtaskData: [
            { id: '1dac7ee4-88a1-45a7-b745-64121fdff258', desc: 'Test subtask', finished: false },
          ],
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
          status: TaskStatus.TO_DO,
          order: 0,
        },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.subtask.create).toHaveBeenCalledWith({
        data: {
          id: '1dac7ee4-88a1-45a7-b745-64121fdff258',
          desc: 'Test subtask',
          taskId: '1',
          finished: false,
          order: 0,
        },
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
          order: 0,
          status: TaskStatus.TO_DO,
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
            status: TaskStatus.TO_DO,
          },
          subtaskData: [
            { id: '1dac7ee4-88a1-45a7-b745-64121fdff258', desc: 'Test subtask', finished: false },
          ],
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
      const subtaskError = new Error('Subtask creation failed');
      prisma.subtask.create.mockRejectedValue(subtaskError);
      prisma.task.findUnique.mockResolvedValue(mockTask);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create some or all subtasks. The main task was created successfully.',
      });
    });

    it('should return 400 status and error message if task data is invalid', async () => {
      req.body = {};

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith([{ message: 'Required', path: ['taskData'] }]);
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
      order: 0,
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
        },
        body: { email: 'john@example.com' },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and added user if the operation was successful', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskExtended);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnTask.findUnique.mockResolvedValue(null);
      prisma.userOnTask.create.mockResolvedValue({
        userId: mockUser.id,
        taskId: mockTask.id,
        createdAt: mockCreatedAt,
      });

      await TasksController.addUserToTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.userOnTask.create).toHaveBeenCalledWith({
        data: { userId: mockUser.id, taskId: req.params!.taskId },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 status and error message if task was not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
    });

    it('should return 400 status and error message if user email has invalid format', async () => {
      req = {
        params: {
          taskId: mockTask.id,
        },
        body: { email: 1 },
      };

      prisma.task.findUnique.mockResolvedValue(mockTaskExtended);
      prisma.user.findUnique.mockResolvedValue(null);

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email data.' });
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
        error: 'User is not assigned to the board. Please add the user to the board first.',
      });
    });

    it('should return 409 status and error message if user is already assigned to the task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTaskExtended);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.userOnTask.findUnique.mockResolvedValue({
        userId: mockUser.id,
        taskId: mockTask.id,
        createdAt: mockCreatedAt,
      });

      await TasksController.addUserToTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'User is already added to this task!' });
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

      prisma.$transaction.mockImplementation(async (fn) => {
        const result = await fn(prisma);
        return result;
      });

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and updated task if task was updated - only taskData was provided', async () => {
      const mockTaskUpdated = {
        ...mockTask,
        title: 'Task One edited',
        assignedUsers: [],
        subtasks: [],
      };
      prisma.task.findUnique.mockResolvedValue(mockTask).mockResolvedValue(mockTaskUpdated);
      prisma.task.update.mockResolvedValue(mockTaskUpdated);

      await TasksController.editTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: req.params!.taskId },
        data: {
          title: 'Task One edited',
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTaskUpdated);
    });

    it('should return 200 status and updated task if only task order changed', async () => {
      req = {
        params: {
          taskId: '1',
        },
        body: {
          taskData: { order: 1 },
        },
      };

      const mockTaskUpdated = {
        ...mockTask,
        assignedUsers: [],
        subtasks: [],
        order: 1,
      };
      prisma.task.findUnique.mockResolvedValue(mockTask).mockResolvedValue(mockTaskUpdated);
      prisma.task.update.mockResolvedValue(mockTaskUpdated);
      // Mock findMany call for current/origin column - target column is empty as only order changed
      prisma.task.findMany.mockResolvedValue([mockTaskUpdated]);

      await TasksController.editTask(req as Request, res as Response, next);

      // First update call
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: req.params!.taskId },
        data: {
          order: 1,
        },
      });
      // Second update call after all tasks within the column were reordered
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: req.params!.taskId },
        data: {
          order: 0,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTaskUpdated);
    });

    it('should return 200 status and updated task if both task order and task status changed', async () => {
      req = {
        params: {
          taskId: '1',
        },
        body: {
          taskData: { order: 1, status: TaskStatus.IN_PROGRESS },
        },
      };

      const mockTaskUpdated = {
        ...mockTask,
        order: 0,
      };

      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(mockTaskUpdated);
      // Mock findMany call for current column
      prisma.task.findMany
        .mockResolvedValueOnce([mockTask]) // Current column before the move
        .mockResolvedValueOnce([]); // Target column (empty)

      await TasksController.editTask(req as Request, res as Response, next);

      // First update call - directly setting `order` and `status`
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: req.params!.taskId },
        data: {
          order: 1,
          status: TaskStatus.IN_PROGRESS,
        },
      });

      // Second update call - reordering in the target column
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: req.params!.taskId },
        data: {
          order: 0, // Correctly recalculated as the first task in the target column
        },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTaskUpdated);
    });

    it('should return 200 status and updated task if task was updated with new subtask', async () => {
      req.body = {
        params: {
          taskId: '1',
        },
        taskData: {},
        subtaskData: [{ id: mockSubtask.id, desc: 'Test subtask' }],
      };
      prisma.task.findUnique.mockResolvedValue(mockTask).mockResolvedValue(mockTaskWithSubtask);
      prisma.subtask.findMany.mockResolvedValue([]);
      prisma.subtask.create.mockResolvedValue({ ...mockSubtask, taskId: mockTask.id });

      await TasksController.editTask(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.subtask.create).toHaveBeenCalledWith({
        data: {
          id: mockSubtask.id,
          taskId: mockTask.id,
          desc: mockSubtask.desc,
          finished: false,
          order: 0,
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTaskWithSubtask);
    });

    it('should return 400 status and error message if provided data is not in a valid format', async () => {
      req = {
        params: {
          taskId: '1',
        },
        body: {
          taskData: { title: 12 }, // one property is enough as the method allows partial updates
        },
      };

      await TasksController.editTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith([
        { message: 'Expected string, received number', path: ['taskData', 'title'] },
      ]);
    });

    it('should return 400 status and error message if task data and subtask data are empty', async () => {
      req.body = {};

      await TasksController.editTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith([
        { message: 'No changes detected. You must modify the task to save changes!', path: [] },
      ]);
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
        createdAt: mockCreatedAt,
      });
      prisma.userOnTask.delete.mockResolvedValue({
        userId: '3713d558-d107-4c4b-b651-a99676e4315e',
        taskId: '1',
        createdAt: mockCreatedAt,
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
