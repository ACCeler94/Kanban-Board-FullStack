import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../prisma/__mocks__/prisma';
import { RequestContext } from 'express-openid-connect';
import { TaskStatus } from '@prisma/client';
import TasksController from '../../controllers/tasks.controller';

vi.mock('../../prisma/prisma.ts');

describe('TasksController', () => {
  const mockTask = {
    id: '1',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    updatedAt: new Date('2024-06-12 16:04:21.778'),
    title: 'Task one',
    desc: 'this is task one',
    boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
    authorId: '3713d558-d107-4c4b-b651-a99676e4315e',
    status: TaskStatus.TO_DO,
  };
  const mockBoard = {
    id: 'board_id',
    name: 'Mock Board',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    updatedAt: new Date('2024-06-12 16:04:21.778'),
    title: 'Mock Board Title',
    authorId: '123',
    users: [{ userId: '3713d558-d107-4c4b-b651-a99676e4315e' }],
  };

  const mockUser = {
    id: '3713d558-d107-4c4b-b651-a99676e4315e',
    name: 'John Smith',
    email: 'john@example.com',
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
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 200 status and the task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);

      await TasksController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: req.params!.taskId },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
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
          title: 'Task one',
          desc: 'this is task one',
          authorId: '3713d558-d107-4c4b-b651-a99676e4315e',
          boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return 201 status and created task', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      prisma.task.create.mockResolvedValue(mockTask);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
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
      req.body = {
        title: 'Task one',
        desc: 'this is task one',
        authorId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
        boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
      };
      prisma.board.findUnique.mockResolvedValue(mockBoard);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access forbidden! User is not assigned to the board.',
      });
    });

    it('should call next with an error if an exception occurs', async () => {
      prisma.board.findUnique.mockResolvedValue(mockBoard);
      const error = new Error('Database error');
      prisma.task.create.mockRejectedValue(error);

      await TasksController.createTask(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
